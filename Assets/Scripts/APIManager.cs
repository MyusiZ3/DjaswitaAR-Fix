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
}

public class APIManager : MonoBehaviour
{
    public static APIManager Instance;

    [Header("Bootstrap Configuration (Master)")]
    [SerializeField] private string masterBaseUrl = "https://efjuwxlhfxpnlenxluus.supabase.co/rest/v1/";
    [SerializeField] private string masterApiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmanV3eGxoZnhwbmxlbnhsdXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjM0NTUsImV4cCI6MjA5MjM5OTQ1NX0.qoiX_I4FnalEw6JuKw1VnO_F6h9klg2B_zbPYR_TKp0";

    [Header("Current Runtime Config")]
    public string activeBaseUrl;
    public string activeApiKey;
    public bool isInitialized = false;

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
                    activeBaseUrl = configs[0].supabase_url;
                    activeApiKey = configs[0].supabase_key;
                    
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
                }
            }
            else
            {
                Debug.LogError("[APIManager] Failed to fetch remote config: " + request.error);
                activeBaseUrl = masterBaseUrl;
                activeApiKey = masterApiKey;
            }
        }

        isInitialized = true;
    }

    /// <summary>
    /// Fetches AR target data from Supabase based on the marker ID.
    /// </summary>
    public IEnumerator GetWisataById(string markerId, Action<ARTargetData> onSuccess, Action<string> onError)
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

                if (dataArray != null && dataArray.Length > 0) onSuccess?.Invoke(dataArray[0]);
                else onError?.Invoke("Data not found for marker: " + markerId);
            }
            else
            {
                onError?.Invoke($"Error fetching data: {request.error}");
            }
        }
    }

    /// <summary>
    /// Fetches all AR targets from Supabase.
    /// </summary>
    public IEnumerator GetAllWisata(Action<ARTargetData[]> onSuccess, Action<string> onError)
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
}
