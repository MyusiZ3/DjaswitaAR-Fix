using System.Collections.Generic;
using UnityEngine;
using System.IO;
using System;
using System.Security.Cryptography;
using System.Text;

/// <summary>
/// Manager untuk caching asset (Image, 3D Model, Video) ke penyimpanan lokal (Disk) dan RAM.
/// Dioptimalkan untuk Android agar tidak download ulang terus menerus.
/// </summary>
public static class AssetCacheManager
{
    private const int MAX_MEMORY_TEXTURES = 12;
    private const long MAX_DISK_CACHE_SIZE = 500 * 1024 * 1024; // 500 MB
    
    private static Dictionary<string, Texture2D> mTextureCache = new Dictionary<string, Texture2D>();
    private static List<string> mTextureUsageOrder = new List<string>();

    // Path folder cache utama
    private static string CacheDirectory 
    {
        get {
            string path = Path.Combine(Application.persistentDataPath, "JawitaCache");
            if (!Directory.Exists(path)) Directory.CreateDirectory(path);
            return path;
        }
    }

    /// <summary>
    /// Mengecek apakah asset ada di Disk.
    /// </summary>
    public static bool IsCached(string url)
    {
        if (string.IsNullOrEmpty(url)) return false;

        // Bypass cache check for Google Drive URLs (always stream)
        if (url.Contains("drive.google.com") || url.Contains("googleusercontent.com"))
        {
            return false;
        }

        string path = GetFilePath(url);
        bool exists = File.Exists(path);
        
        if (exists)
            Debug.Log($"[AssetCacheManager] CACHE HIT: {url}");
        else
            Debug.Log($"[AssetCacheManager] CACHE MISS: {url}");
            
        return exists;
    }

    public static bool IsTextureInMemory(string url)
    {
        return mTextureCache.ContainsKey(url) && mTextureCache[url] != null;
    }

    public static string GetLocalPath(string url)
    {
        string path = GetFilePath(url);
        if (File.Exists(path))
        {
            try { File.SetLastAccessTime(path, DateTime.Now); } catch {}
            return path;
        }
        return null;
    }

    public static Texture2D GetTexture(string url)
    {
        if (mTextureCache.ContainsKey(url))
        {
            UpdateTextureUsage(url);
            return mTextureCache[url];
        }

        string path = GetFilePath(url);
        if (File.Exists(path))
        {
            try {
                byte[] bytes = File.ReadAllBytes(path);
                Texture2D tex = new Texture2D(2, 2);
                if (tex.LoadImage(bytes))
                {
                    File.SetLastAccessTime(path, DateTime.Now);
                    AddToTextureMemory(url, tex);
                    return tex;
                }
            } catch (Exception e) {
                Debug.LogError("[AssetCacheManager] Error loading texture: " + e.Message);
            }
        }
        return null;
    }

    public static void SaveAsset(string url, byte[] data)
    {
        if (data == null || data.Length == 0) return;
        
        try {
            string path = GetFilePath(url);
            File.WriteAllBytes(path, data);
            File.SetLastAccessTime(path, DateTime.Now);
            Debug.Log($"[AssetCacheManager] ASSET SAVED TO DISK: {path} ({data.Length} bytes)");
            CleanupDiskCache();
        } catch (Exception e) {
            Debug.LogError("[AssetCacheManager] Failed to save asset: " + e.Message);
        }
    }

    public static void SaveImage(string url, byte[] data)
    {
        SaveAsset(url, data);
        Texture2D tex = new Texture2D(2, 2);
        if (tex.LoadImage(data))
        {
            AddToTextureMemory(url, tex);
        }
        else
        {
            UnityEngine.Object.Destroy(tex);
        }
    }

    private static void AddToTextureMemory(string url, Texture2D texture)
    {
        if (mTextureCache.ContainsKey(url))
        {
            UpdateTextureUsage(url);
            return;
        }

        if (mTextureCache.Count >= MAX_MEMORY_TEXTURES)
        {
            string oldest = mTextureUsageOrder[0];
            if (mTextureCache.ContainsKey(oldest))
            {
                UnityEngine.Object.Destroy(mTextureCache[oldest]);
                mTextureCache.Remove(oldest);
            }
            mTextureUsageOrder.RemoveAt(0);
        }

        mTextureCache[url] = texture;
        mTextureUsageOrder.Add(url);
    }

    private static void UpdateTextureUsage(string url)
    {
        if (mTextureUsageOrder.Contains(url))
        {
            mTextureUsageOrder.Remove(url);
            mTextureUsageOrder.Add(url);
        }
    }

    /// <summary>
    /// Membuat nama file unik berdasarkan URL. 
    /// Normalisasi dilakukan untuk menghindari cache miss karena query parameter.
    /// </summary>
    private static string GetFilePath(string url)
    {
        if (string.IsNullOrEmpty(url)) return "";

        string cleanUrl = url;
        string extension = "";

        // Check if there is an explicit extension query parameter (e.g. &ext=mp4 or &ext=.glb)
        if (url.Contains("ext="))
        {
            System.Text.RegularExpressions.Match extMatch = System.Text.RegularExpressions.Regex.Match(url, @"ext=([^&]+)");
            if (extMatch.Success)
            {
                extension = extMatch.Groups[1].Value.Trim().ToLower();
                if (!extension.StartsWith(".")) extension = "." + extension;
            }
        }

        // Process GDrive or regular URLs
        if (url.Contains("drive.google.com") || url.Contains("googleusercontent.com"))
        {
            // GDrive URLs are unique by their 'id' parameter.
            // Extract 'id' to create a unique hash.
            System.Text.RegularExpressions.Match idMatch = System.Text.RegularExpressions.Regex.Match(url, @"id=([^&]+)");
            if (idMatch.Success)
            {
                cleanUrl = "gdrive_" + idMatch.Groups[1].Value;
            }
            else
            {
                // Fallback: use full url if id is not found
                cleanUrl = url;
            }

            // Default extension for GDrive if not explicitly set via 'ext=' query parameter
            if (string.IsNullOrEmpty(extension))
            {
                extension = ".glb"; // Default fallback
            }
        }
        else
        {
            // Standard URL: split by '?' to avoid cache misses on temporary tokens/version queries
            if (url.Contains("?"))
            {
                cleanUrl = url.Split('?')[0];
            }

            // Get extension from Path if not explicitly set via 'ext='
            if (string.IsNullOrEmpty(extension))
            {
                try
                {
                    string parsedExtension = Path.GetExtension(new Uri(cleanUrl).AbsolutePath);
                    if (!string.IsNullOrEmpty(parsedExtension))
                    {
                        extension = parsedExtension;
                    }
                }
                catch {}
            }
        }

        // Final fallback extension
        if (string.IsNullOrEmpty(extension))
        {
            extension = ".glb";
        }

        using (MD5 md5 = MD5.Create())
        {
            byte[] hash = md5.ComputeHash(Encoding.UTF8.GetBytes(cleanUrl));
            string fileName = BitConverter.ToString(hash).Replace("-", "").ToLower();
            return Path.Combine(CacheDirectory, fileName + extension);
        }
    }

    private static void CleanupDiskCache()
    {
        try {
            DirectoryInfo di = new DirectoryInfo(CacheDirectory);
            if (!di.Exists) return;

            FileInfo[] files = di.GetFiles();
            long currentSize = 0;
            foreach (var file in files) currentSize += file.Length;

            if (currentSize > MAX_DISK_CACHE_SIZE)
            {
                Array.Sort(files, (a, b) => a.LastAccessTime.CompareTo(b.LastAccessTime));
                long sizeToRemove = currentSize - (long)(MAX_DISK_CACHE_SIZE * 0.8f);
                long removedSize = 0;

                foreach (var file in files)
                {
                    if (removedSize >= sizeToRemove) break;
                    removedSize += file.Length;
                    file.Delete();
                }
                Debug.Log($"[AssetCacheManager] Disk cache cleaned: Removed {removedSize / 1024 / 1024}MB");
            }
        } catch (Exception e) {
            Debug.LogWarning("[AssetCacheManager] Cleanup failed: " + e.Message);
        }
    }

    public static void ClearCache()
    {
        foreach (var tex in mTextureCache.Values)
        {
            if (tex != null) UnityEngine.Object.Destroy(tex);
        }
        mTextureCache.Clear();
        mTextureUsageOrder.Clear();

        if (Directory.Exists(CacheDirectory))
        {
            Directory.Delete(CacheDirectory, true);
        }
        Debug.Log("[AssetCacheManager] All Cache Cleared");
    }
}
