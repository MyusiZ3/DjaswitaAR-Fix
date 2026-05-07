using UnityEngine;

/// <summary>
/// Menangani interaksi rotasi (swipe satu jari), zoom (pinch dua jari), 
/// dan rotasi otomatis (idle) pada objek 3D di AR.
/// </summary>
public class ModelInteraction : MonoBehaviour
{
    [Header("Manual Rotation")]
    [Tooltip("Kecepatan rotasi saat di-swipe jari")]
    public float rotationSpeed = 0.2f;
    
    [Header("Idle Rotation (Auto)")]
    [Tooltip("Aktifkan rotasi otomatis saat tidak disentuh")]
    public bool useIdleRotation = true;
    [Tooltip("Kecepatan rotasi otomatis (Y axis)")]
    public float idleRotationSpeed = 15f;

    [Header("Zoom Settings")]
    public float zoomSpeed = 0.005f;
    public float minScaleMultiplier = 0.3f;
    public float maxScaleMultiplier = 5.0f;

    private Vector3 mInitialLocalPosition;
    private Quaternion mInitialLocalRotation;
    private Vector3 mInitialLocalScale;

    private bool mIsInitialized = false;
    private bool mIsBeingTouched = false;

    /// <summary>
    /// Simpan keadaan awal model setelah di-load dan di-normalize ukurannya.
    /// </summary>
    public void SaveInitialState()
    {
        mInitialLocalPosition = transform.localPosition;
        mInitialLocalRotation = transform.localRotation;
        mInitialLocalScale = transform.localScale;
        mIsInitialized = true;
        Debug.Log("[ModelInteraction] Initial state saved for: " + gameObject.name);
    }

    /// <summary>
    /// Kembalikan model ke posisi, rotasi, dan skala semula.
    /// </summary>
    public void ResetState()
    {
        if (!mIsInitialized) return;
        
        transform.localPosition = mInitialLocalPosition;
        transform.localRotation = mInitialLocalRotation;
        transform.localScale = mInitialLocalScale;
        mIsBeingTouched = false;
    }

    void Update()
    {
        if (!mIsInitialized) return;

        // Handle Input
        if (Input.touchCount == 1)
        {
            mIsBeingTouched = true;
            HandleRotation();
        }
        else if (Input.touchCount == 2)
        {
            mIsBeingTouched = true;
            HandleZoom();
        }
        else
        {
            mIsBeingTouched = false;
            HandleIdleRotation();
        }
    }

    private void HandleIdleRotation()
    {
        if (useIdleRotation && !mIsBeingTouched)
        {
            // Berputar perlahan di sumbu Y (up)
            transform.Rotate(Vector3.up, idleRotationSpeed * Time.deltaTime, Space.Self);
        }
    }

    private void HandleRotation()
    {
        Touch touch = Input.GetTouch(0);

        if (touch.phase == TouchPhase.Moved)
        {
            float xRot = touch.deltaPosition.x * rotationSpeed;
            float yRot = touch.deltaPosition.y * rotationSpeed;

            // Rotasi horizontal (Y axis) dan vertikal (X axis)
            // Menggunakan Space.Self agar rotasi terasa lebih alami terhadap objek
            transform.Rotate(Vector3.up, -xRot, Space.World);
            transform.Rotate(Vector3.right, yRot, Space.World);
        }
    }

    private void HandleZoom()
    {
        Touch touch0 = Input.GetTouch(0);
        Touch touch1 = Input.GetTouch(1);

        if (touch0.phase == TouchPhase.Moved || touch1.phase == TouchPhase.Moved)
        {
            Vector2 prevPos0 = touch0.position - touch0.deltaPosition;
            Vector2 prevPos1 = touch1.position - touch1.deltaPosition;

            float prevDistance = (prevPos0 - prevPos1).magnitude;
            float currentDistance = (touch0.position - touch1.position).magnitude;

            float delta = currentDistance - prevDistance;
            float zoomAmount = delta * zoomSpeed;

            Vector3 nextScale = transform.localScale + (Vector3.one * zoomAmount);

            // Hitung rasio terhadap skala awal agar tidak kebesaran/kekecilan
            float scaleRatio = nextScale.x / mInitialLocalScale.x;
            
            if (float.IsNaN(scaleRatio) || float.IsInfinity(scaleRatio)) return;

            if (scaleRatio >= minScaleMultiplier && scaleRatio <= maxScaleMultiplier)
            {
                transform.localScale = nextScale;
            }
        }
    }
}
