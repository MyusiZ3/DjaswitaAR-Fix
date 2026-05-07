using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using System.Collections;

public class SceneTransitionManager : MonoBehaviour
{
    [Header("Sequence Settings")]
    public string targetSceneName = "MainScene";
    public float durationStep1 = 3.0f;
    public float durationStep2 = 2.0f;
    public float fadeDuration = 0.8f;

    [Header("Colors")]
    public Color fadeInColor = Color.white;
    public Color fadeOutColor = Color.black;

    [Header("Audio Settings")]
    public AudioSource audioSource;
    public AudioClip audioClipStep2;
    public bool fadeAudio = true; // Opsi mau audio di-fade atau tidak

    [Header("UI Canvas Groups")]
    public CanvasGroup groupStep1;
    public CanvasGroup groupStep2;
    public CanvasGroup fadeOverlayGroup;
    public Image fadeOverlayImage;

    private void Start()
    {
        groupStep1.alpha = 1;
        groupStep2.alpha = 0;
        
        if (fadeOverlayGroup != null && fadeOverlayImage != null)
        {
            fadeOverlayImage.color = fadeInColor;
            fadeOverlayGroup.alpha = 1;
            StartCoroutine(Fade(fadeOverlayGroup, 1, 0));
        }

        StartCoroutine(ExecuteSequence());
    }

    IEnumerator ExecuteSequence()
    {
        yield return new WaitForSeconds(durationStep1);

        // --- MULAI STEP 2 ---
        if (audioSource != null && audioClipStep2 != null)
        {
            audioSource.clip = audioClipStep2;
            audioSource.volume = 0; 
            audioSource.Play();
            if (fadeAudio) StartCoroutine(FadeAudioVolume(audioSource, 0, 1));
            else audioSource.volume = 1;
        }

        // Jalankan fade secara paralel
        StartCoroutine(Fade(groupStep1, 1, 0));
        yield return StartCoroutine(Fade(groupStep2, 0, 1));

        yield return new WaitForSeconds(durationStep2);

        // --- PERSIAPAN PINDAH SCENE ---
        // Sambil layar jadi hitam, suara mengecil (Fade Out)
        if (fadeAudio && audioSource != null) StartCoroutine(FadeAudioVolume(audioSource, 1, 0));

        if (fadeOverlayGroup != null && fadeOverlayImage != null)
        {
            fadeOverlayImage.color = fadeOutColor;
            yield return StartCoroutine(Fade(fadeOverlayGroup, 0, 1));
        }

        SceneManager.LoadScene(targetSceneName);
    }

    // Coroutine untuk Fade UI
    IEnumerator Fade(CanvasGroup cg, float start, float end)
    {
        float time = 0;
        while (time < fadeDuration)
        {
            time += Time.deltaTime;
            cg.alpha = Mathf.Lerp(start, end, time / fadeDuration);
            yield return null;
        }
        cg.alpha = end;
    }

    // Coroutine Baru untuk Fade Audio
    IEnumerator FadeAudioVolume(AudioSource source, float startVol, float endVol)
    {
        float time = 0;
        while (time < fadeDuration)
        {
            time += Time.deltaTime;
            source.volume = Mathf.Lerp(startVol, endVol, time / fadeDuration);
            yield return null;
        }
        source.volume = endVol;
    }
}
