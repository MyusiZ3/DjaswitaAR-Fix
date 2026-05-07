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

    private void OnVuforiaStarted()
    {
        StartCoroutine(DelayedScanPromptPlay());
        StartCoroutine(LoadMarkersFromDatabase());
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
    }

    public void MarkerLost()
    {
        activeMarkers--;
        if (activeMarkers <= 0)
        {
            activeMarkers = 0;
            StartCoroutine(DelayedScanPromptPlay());
        }
    }

    private IEnumerator LoadMarkersFromDatabase()
    {
        Debug.Log("[DynamicMarker] Fetching data from Supabase...");
        
        yield return APIManager.Instance.GetAllWisata(
            (dataList) => {
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
            }
        );
    }

    private IEnumerator CreateRuntimeTarget(WisataData data)
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
