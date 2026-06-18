using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using System;
using System.Collections.Generic;

[Serializable]
public class AppConfig
{
    public string id;
    public string supabase_url;
    public string supabase_key;
    public string gdrive_api_key;
}

public class APIManager : MonoBehaviour
{
    public static APIManager Instance;

    [Header("Bootstrap Configuration (Master)")]
    [SerializeField] private string masterBaseUrl = "https://efjuwxlhfxpnlenxluus.supabase.co/rest/v1/";
    [SerializeField] private string masterApiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmanV3eGxoZnhwbmxlbnhsdXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjM0NTUsImV4cCI6MjA5MjM5OTQ1NX0.qoiX_I4FnalEw6JuKw1VnO_F6h9klg2B_zbPYR_TKp0";
    [SerializeField] private string masterGDriveApiKey = "AIzaSyCqOuvDt8stKiEzMq8d9eZVIIM1jbJjR14";

    [Header("Current Runtime Config")]
    public string activeBaseUrl;
    public string activeApiKey;
    public string activeGDriveApiKey;
    public bool isInitialized = false;

    [Header("Hot-Reload / Targets Cache")]
    public List<ARTargetData> targetsCache = new List<ARTargetData>();
    public event Action<List<ARTargetData>> OnTargetsUpdated;

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            StartCoroutine(InitializeRemoteConfig());
        }
        else
        {
            Destroy(gameObject);
        }
    }

    private IEnumerator InitializeRemoteConfig()
    {
        Debug.Log("[APIManager] Initializing Remote Config...");
        
        // Use master credentials to fetch the latest config
        string url = masterBaseUrl + "app_settings?id=eq.current_config";
        
        using (UnityWebRequest request = UnityWebRequest.Get(url))
        {
            request.SetRequestHeader("apikey", masterApiKey);
            request.SetRequestHeader("Authorization", "Bearer " + masterApiKey);

            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                string json = request.downloadHandler.text;
                Debug.Log("[APIManager] Remote Config Received: " + json);
                
                AppConfig[] configs = JsonHelper.FromJson<AppConfig>(json);
                if (configs != null && configs.Length > 0)
                {
                    activeBaseUrl = string.IsNullOrEmpty(configs[0].supabase_url) ? masterBaseUrl : configs[0].supabase_url;
                    activeApiKey = string.IsNullOrEmpty(configs[0].supabase_key) ? masterApiKey : configs[0].supabase_key;
                    activeGDriveApiKey = string.IsNullOrEmpty(configs[0].gdrive_api_key) ? masterGDriveApiKey : configs[0].gdrive_api_key;
                    
                    // Ensure URL ends with /rest/v1/
                    if (!activeBaseUrl.EndsWith("/rest/v1/"))
                    {
                        if (activeBaseUrl.EndsWith("/")) activeBaseUrl += "rest/v1/";
                        else activeBaseUrl += "/rest/v1/";
                    }

                    Debug.Log("[APIManager] Config Updated: " + activeBaseUrl);
                }
                else
                {
                    Debug.LogWarning("[APIManager] No config found in DB, using master defaults.");
                    activeBaseUrl = masterBaseUrl;
                    activeApiKey = masterApiKey;
                    activeGDriveApiKey = masterGDriveApiKey;
                }
            }
            else
            {
                Debug.LogError("[APIManager] Failed to fetch remote config: " + request.error);
                activeBaseUrl = masterBaseUrl;
                activeApiKey = masterApiKey;
                activeGDriveApiKey = masterGDriveApiKey;
            }
        }

        isInitialized = true;
    }

    /// <summary>
    /// Fetches wisata data from Supabase based on the marker ID.
    /// </summary>
    public IEnumerator GetTargetById(string markerId, Action<ARTargetData> onSuccess, Action<string> onError)
    {
        while (!isInitialized) yield return null;

        string url = $"{activeBaseUrl}ar_targets?id=eq.{markerId}";

        using (UnityWebRequest request = UnityWebRequest.Get(url))
        {
            request.SetRequestHeader("apikey", activeApiKey);
            request.SetRequestHeader("Authorization", "Bearer " + activeApiKey);

            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                string json = request.downloadHandler.text;
                ARTargetData[] dataArray = JsonHelper.FromJson<ARTargetData>(json);

                if (dataArray != null && dataArray.Length > 0)
                {
                    NormalizeGDriveUrls(dataArray[0]);
                    onSuccess?.Invoke(dataArray[0]);
                }
                else onError?.Invoke("Data not found for marker: " + markerId);
            }
            else
            {
                onError?.Invoke($"Error fetching data: {request.error}");
            }
        }
    }

    /// <summary>
    /// Fetches all wisata data from Supabase.
    /// </summary>
    public IEnumerator GetAllTargets(Action<ARTargetData[]> onSuccess, Action<string> onError)
    {
        while (!isInitialized) yield return null;

        string url = activeBaseUrl + "ar_targets";

        using (UnityWebRequest request = UnityWebRequest.Get(url))
        {
            request.SetRequestHeader("apikey", activeApiKey);
            request.SetRequestHeader("Authorization", "Bearer " + activeApiKey);

            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                string json = request.downloadHandler.text;
                ARTargetData[] dataArray = JsonHelper.FromJson<ARTargetData>(json);
                if (dataArray != null)
                {
                    foreach (var data in dataArray)
                    {
                        NormalizeGDriveUrls(data);
                    }
                }
                onSuccess?.Invoke(dataArray);
            }
            else
            {
                onError?.Invoke($"Error fetching all data: {request.error}");
            }
        }
    }

    /// <summary>
    /// Logs a scan event to Supabase.
    /// </summary>
    public IEnumerator LogScan(string wisataId)
    {
        while (!isInitialized) yield return null;

        string url = activeBaseUrl + "scans";
        string deviceInfo = SystemInfo.deviceModel + " (" + SystemInfo.operatingSystem + ")";
        
        // Simple JSON object for POST
        string jsonPayload = $"{{\"target_id\": \"{wisataId}\", \"device_info\": \"{deviceInfo}\"}}";
        byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonPayload);

        using (UnityWebRequest request = new UnityWebRequest(url, "POST"))
        {
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            request.SetRequestHeader("apikey", activeApiKey);
            request.SetRequestHeader("Authorization", "Bearer " + activeApiKey);
            request.SetRequestHeader("Prefer", "return=minimal"); 

            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                Debug.Log($"[APIManager] Scan logged successfully for: {wisataId}");
            }
            else
            {
                Debug.LogWarning($"[APIManager] Failed to log scan: {request.error}\nResponse: {request.downloadHandler.text}");
            }
        }
    }

    private void NormalizeGDriveUrls(ARTargetData data)
    {
        if (data == null) return;
        
        data.model_url = AppendGDriveExtension(data.model_url, ".glb");
        data.video_url = AppendGDriveExtension(data.video_url, ".mp4");
        
        // Normalize slides urls too
        if (!string.IsNullOrEmpty(data.slide_urls))
        {
            string[] slides = data.slide_urls.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
            for (int i = 0; i < slides.Length; i++)
            {
                slides[i] = AppendGDriveExtension(slides[i].Trim(), ".png");
            }
            data.slide_urls = string.Join(",", slides);
        }
        
        data.marker_url = AppendGDriveExtension(data.marker_url, ".png");
    }

    private string AppendGDriveExtension(string url, string defaultExt)
    {
        if (string.IsNullOrEmpty(url)) return url;
        if (url.Contains("drive.google.com") || url.Contains("googleusercontent.com"))
        {
            if (!url.Contains("ext="))
            {
                string separator = url.Contains("?") ? "&" : "?";
                return url + separator + "ext=" + defaultExt;
            }
        }
        return url;
    }

    /// <summary>
    /// Refreshes the target cache and triggers the hot-reload event.
    /// </summary>
    public IEnumerator RefreshTargets(Action<List<ARTargetData>> onSuccess = null, Action<string> onError = null)
    {
        yield return GetAllTargets(
            (dataArray) => {
                targetsCache.Clear();
                if (dataArray != null)
                {
                    targetsCache.AddRange(dataArray);
                }
                OnTargetsUpdated?.Invoke(targetsCache);
                onSuccess?.Invoke(targetsCache);
            },
            (error) => {
                onError?.Invoke(error);
            }
        );
    }
}
