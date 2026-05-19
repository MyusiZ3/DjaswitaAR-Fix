using UnityEngine;
using Vuforia;
using System.Collections.Generic;
using System.Collections;
using UnityEngine.Networking;

public class DynamicMarkerManager : MonoBehaviour
{
    [Header("Configuration")]
    public GameObject uiPrefab; // Prefab yang berisi ARTargetHandler dan UI
    public float targetWidth = 0.1f; // Lebar marker dalam meter (misal: 10cm)

    [Header("UI Configuration")]
    public GameObject scanPrompt; // Teks "Arahkan Kamera ke Marker"
    public GameObject noInternetPrompt; // Animasi Lottie saat tidak ada internet

    public static DynamicMarkerManager Instance;
    private int activeMarkers = 0;
    
    // Set untuk mencegah duplikasi marker yang diload
    private HashSet<string> loadedMarkers = new HashSet<string>();

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
        }
        else
        {
            Destroy(gameObject);
        }
    }

    private void Start()
    {
        // Tunggu Vuforia siap
        VuforiaApplication.Instance.OnVuforiaStarted += OnVuforiaStarted;
    }

    private void OnDestroy()
    {
        if (VuforiaApplication.Instance != null)
        {
            VuforiaApplication.Instance.OnVuforiaStarted -= OnVuforiaStarted;
        }
    }

    private Coroutine connectionMonitor;

    private void OnVuforiaStarted()
    {
        // Mulai pantau koneksi secara real-time
        if (connectionMonitor != null) StopCoroutine(connectionMonitor);
        connectionMonitor = StartCoroutine(MonitorInternetConnection());

        if (Application.internetReachability != NetworkReachability.NotReachable)
        {
            StartCoroutine(LoadMarkersFromDatabase());
        }
    }

    private IEnumerator MonitorInternetConnection()
    {
        NetworkReachability prevStatus = Application.internetReachability;
        
        // Cek awal
        if (prevStatus == NetworkReachability.NotReachable) ShowNoInternet();
        else ShowScanPrompt();

        while (true)
        {
            yield return new WaitForSeconds(1.0f); // Cek setiap 1 detik

            NetworkReachability currentStatus = Application.internetReachability;
            if (currentStatus != prevStatus)
            {
                prevStatus = currentStatus;

                if (currentStatus == NetworkReachability.NotReachable)
                {
                    // Internet terputus!
                    ShowNoInternet();
                }
                else
                {
                    // Internet kembali!
                    ShowScanPrompt();
                    
                    // Jika sebelumnya gagal load database, coba load ulang
                    if (loadedMarkers.Count == 0)
                    {
                        StartCoroutine(LoadMarkersFromDatabase());
                    }
                }
            }
        }
    }

    public void ShowNoInternet()
    {
        if (scanPrompt) scanPrompt.SetActive(false);
        if (noInternetPrompt) 
        {
            noInternetPrompt.SetActive(true);
            // Mainkan animasi lottie jika komponen ada
            noInternetPrompt.BroadcastMessage("Play", SendMessageOptions.DontRequireReceiver);
        }
    }

    public void ShowScanPrompt()
    {
        if (noInternetPrompt) noInternetPrompt.SetActive(false);
        if (activeMarkers <= 0)
        {
            StartCoroutine(DelayedScanPromptPlay());
        }
    }

    private IEnumerator DelayedScanPromptPlay()
    {
        if (scanPrompt) 
        {
            scanPrompt.SetActive(true);
            // Tunggu 1 frame agar komponen Lottie selesai inisialisasi internal
            yield return null;
            scanPrompt.BroadcastMessage("Play", SendMessageOptions.DontRequireReceiver);
        }
    }

    public void MarkerTracked()
    {
        activeMarkers++;
        if (scanPrompt) scanPrompt.SetActive(false);
        if (noInternetPrompt) noInternetPrompt.SetActive(false);
    }

    public void MarkerLost()
    {
        activeMarkers--;
        if (activeMarkers <= 0)
        {
            activeMarkers = 0;
            // Jika saat hilang marker ternyata internet mati, tampilkan No Internet
            if (Application.internetReachability == NetworkReachability.NotReachable)
            {
                ShowNoInternet();
            }
            else
            {
                ShowScanPrompt();
            }
        }
    }

    private IEnumerator LoadMarkersFromDatabase()
    {
        Debug.Log("[DynamicMarker] Fetching data from Supabase...");
        
        yield return APIManager.Instance.GetAllWisata(
            (dataList) => {
                // Pastikan kembali ke mode scan prompt jika berhasil
                ShowScanPrompt();
                
                foreach (var data in dataList)
                {
                    if (!string.IsNullOrEmpty(data.marker_url) && !loadedMarkers.Contains(data.id))
                    {
                        loadedMarkers.Add(data.id);
                        StartCoroutine(CreateRuntimeTarget(data));
                    }
                }
            },
            (error) => {
                Debug.LogError("[DynamicMarker] Failed to fetch data: " + error);
                ShowNoInternet();
            }
        );
    }

    private IEnumerator CreateRuntimeTarget(ARTargetData data)
    {
        Debug.Log($"[DynamicMarker] Creating target for: {data.nama}");

        // Cek apakah target dengan ID (TargetName) ini sudah ada di scene secara manual
        ObserverBehaviour[] existingObservers = FindObjectsByType<ObserverBehaviour>(FindObjectsInactive.Include, FindObjectsSortMode.None);
        foreach (var observer in existingObservers)
        {
            if (observer.TargetName == data.id)
            {
                Debug.Log($"[DynamicMarker] Target {data.id} already exists in scene. Skipping dynamic creation to prevent stacking.");
                yield break;
            }
        }

        // Ambil gambar marker khusus dari database
        string markerImageUrl = data.marker_url.Trim();

        Debug.Log($"[DynamicMarker] Downloading marker from URL: '{markerImageUrl}'");

        Texture2D texture = null;

        // 1. Cek Cache (RAM/Disk)
        texture = AssetCacheManager.GetTexture(markerImageUrl);

        // 2. Jika tidak ada di cache, download
        if (texture == null)
        {
            using (UnityWebRequest request = UnityWebRequest.Get(markerImageUrl))
            {
                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    byte[] bytes = request.downloadHandler.data;
                    AssetCacheManager.SaveImage(markerImageUrl, bytes);
                    texture = AssetCacheManager.GetTexture(markerImageUrl);
                }
                else
                {
                    Debug.LogError($"[DynamicMarker] Failed to download marker image for {data.nama}: {request.error}");
                }
            }
        }

        if (texture != null)
        {
            // Buat Image Target di Runtime dengan lebar 0.16m
            var target = VuforiaBehaviour.Instance.ObserverFactory.CreateImageTarget(
                texture, 
                0.16f, // Physical Width: 0.16m
                data.id
            );

            if (target != null)
            {
                Debug.Log($"[DynamicMarker] Created target: {data.id} with width 0.16m");
                
                if (uiPrefab != null)
                {
                    GameObject content = Instantiate(uiPrefab, target.transform);
                    content.transform.localPosition = Vector3.zero;
                    content.transform.localRotation = Quaternion.identity;

                    ARTargetHandler handler = content.GetComponent<ARTargetHandler>();
                    if (handler != null)
                    {
                        handler.Initialize(data);
                    }
                }
            }
        }
    }
}
