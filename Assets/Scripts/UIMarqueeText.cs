using UnityEngine;
using TMPro;

public class UIMarqueeText : MonoBehaviour
{
    [Header("Settings")]
    public float scrollSpeed = 50f;
    public float pauseDuration = 2f;
    public bool isRightAligned = true; // Centang ini untuk rata kanan

    private TextMeshProUGUI mTextComponent;
    private RectTransform mRectTransform;
    private RectTransform mParentRectTransform;

    private float mTextWidth;
    private float mParentWidth;
    private bool mShouldScroll = false;
    private float mPauseTimer;
    private string mLastText;

    void Awake()
    {
        mTextComponent = GetComponent<TextMeshProUGUI>();
        mRectTransform = GetComponent<RectTransform>();
        mParentRectTransform = transform.parent.GetComponent<RectTransform>();
    }

    void OnEnable()
    {
        // Tunggu frame berikutnya supaya layout parent sudah terhitung (penting di Vuforia)
        Invoke("ResetMarquee", 0.05f);
    }

    void Update()
    {
        if (!mShouldScroll) return;

        if (mPauseTimer > 0)
        {
            mPauseTimer -= Time.deltaTime;
            return;
        }

        // Bergerak ke kiri
        mRectTransform.anchoredPosition += Vector2.left * scrollSpeed * Time.deltaTime;

        // Cek jika teks sudah terlewat semua ke kiri
        if (isRightAligned)
        {
            // Jika ujung kanan teks sudah melewati batas kiri container
            if (mRectTransform.anchoredPosition.x < -mParentWidth)
            {
                // Reset muncul dari kanan (X: mTextWidth supaya ujung kirinya muncul di kanan)
                mRectTransform.anchoredPosition = new Vector2(mTextWidth, mRectTransform.anchoredPosition.y);
                mPauseTimer = 0.5f;
            }
        }
        else
        {
            if (mRectTransform.anchoredPosition.x < -mTextWidth)
            {
                mRectTransform.anchoredPosition = new Vector2(mParentWidth, mRectTransform.anchoredPosition.y);
                mPauseTimer = 0.5f;
            }
        }
    }

    public void ResetMarquee()
    {
        if (mTextComponent == null || mParentRectTransform == null) return;

        // 1. Pastikan teks tidak membungkus ke bawah dan mode overflow adalah Overflow agar tidak terpotong
        mTextComponent.textWrappingMode = TextWrappingModes.NoWrap;
        mTextComponent.overflowMode = TextOverflowModes.Overflow;

        // Paksa update mesh agar preferredWidth akurat sebelum diukur
        mTextComponent.ForceMeshUpdate();

        // Force update canvas agar perhitungan preferredWidth akurat
        Canvas.ForceUpdateCanvases();
        if (mParentRectTransform != null)
            UnityEngine.UI.LayoutRebuilder.ForceRebuildLayoutImmediate(mParentRectTransform);

        // 2. Gunakan preferredWidth untuk mendapatkan lebar asli teks
        // Tambahkan buffer kecil (5px) untuk menghindari clipping akibat pembulatan floating point
        mTextWidth = mTextComponent.preferredWidth + 5f;
        mParentWidth = mParentRectTransform.rect.width;

        // Fallback jika lebar parent belum terhitung (biasanya saat pertama kali aktif)
        if (mParentWidth <= 1f) mParentWidth = mParentRectTransform.sizeDelta.x;
        if (mParentWidth <= 1f) mParentWidth = 400f; // Default fallback yang aman

        // Cek apakah teks perlu jalan (marquee)
        mShouldScroll = mTextWidth > mParentWidth;

        // 3. Paksa lebar RectTransform teks
        // Jika tidak scroll (pendek), buat lebarnya sama dengan parent agar aman dan alignment TMP (Kanan/Kiri) bekerja normal.
        // Jika scroll (panjang), buat selebar teks asli agar logic pergeseran anchoredPosition berjalan lancar.
        float finalWidth = mShouldScroll ? mTextWidth : mParentWidth;
        mRectTransform.SetSizeWithCurrentAnchors(RectTransform.Axis.Horizontal, finalWidth);

        // --- PENTING: Paksa Anchor dan Pivot agar sinkron dengan alignment ---
        // Ini memastikan pos.x = 0 benar-benar berarti "di pinggir kontainer" dan tidak terpotong Mask.
        if (isRightAligned)
        {
            mRectTransform.anchorMin = new Vector2(1f, 0.5f);
            mRectTransform.anchorMax = new Vector2(1f, 0.5f);
            mRectTransform.pivot = new Vector2(1f, 0.5f);
        }
        else
        {
            mRectTransform.anchorMin = new Vector2(0f, 0.5f);
            mRectTransform.anchorMax = new Vector2(0f, 0.5f);
            mRectTransform.pivot = new Vector2(0f, 0.5f);
        }

        // Reset posisi ke awal (X=0)
        mRectTransform.anchoredPosition = new Vector2(0, mRectTransform.anchoredPosition.y);

        mPauseTimer = pauseDuration;
    }

    void LateUpdate()
    {
        if (mTextComponent.text != mLastText)
        {
            mLastText = mTextComponent.text;
            ResetMarquee();
        }
    }
}
