using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.EnhancedTouch;
using Touch = UnityEngine.InputSystem.EnhancedTouch.Touch;
using TouchPhase = UnityEngine.InputSystem.TouchPhase;

/// <summary>
/// Menangani interaksi rotasi (swipe satu jari/mouse), zoom (pinch dua jari/scroll), 
/// dan rotasi otomatis (idle) pada objek 3D di AR.
/// Menggunakan Unity Input System yang baru.
/// </summary>
public class ModelInteraction : MonoBehaviour
{
    [Header("Manual Rotation")]
    [Tooltip("Kecepatan rotasi saat di-swipe jari/mouse")]
    public float rotationSpeed = 0.5f;
    
    [Header("Idle Rotation (Auto)")]
    [Tooltip("Aktifkan rotasi otomatis saat tidak disentuh")]
    public bool useIdleRotation = true;
    [Tooltip("Kecepatan rotasi otomatis (Y axis)")]
    public float idleRotationSpeed = 15f;

    [Header("Zoom Settings")]
    public float zoomSpeed = 0.01f;
    public float minScaleMultiplier = 0.3f;
    public float maxScaleMultiplier = 5.0f;

    private Vector3 mInitialLocalPosition;
    private Quaternion mInitialLocalRotation;
    private Vector3 mInitialLocalScale;

    private bool mIsInitialized = false;
    private bool mIsBeingTouched = false;

    private Vector2 mLastMousePosition;

    void OnEnable()
    {
        EnhancedTouchSupport.Enable();
    }

    void OnDisable()
    {
        EnhancedTouchSupport.Disable();
    }

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

        bool hasInput = false;

        // Handle Touch Input via EnhancedTouch
        if (Touch.activeTouches.Count == 1)
        {
            hasInput = true;
            HandleRotation();
        }
        else if (Touch.activeTouches.Count == 2)
        {
            hasInput = true;
            HandleZoom();
        }

        // Handle Mouse Input for Editor Testing
#if UNITY_EDITOR || UNITY_STANDALONE
        Mouse mouse = Mouse.current;
        if (mouse != null)
        {
            if (mouse.leftButton.wasPressedThisFrame)
            {
                mLastMousePosition = mouse.position.ReadValue();
            }

            if (mouse.leftButton.isPressed)
            {
                hasInput = true;
                HandleMouseRotation(mouse);
            }
            
            float scrollDelta = mouse.scroll.ReadValue().y;
            if (Mathf.Abs(scrollDelta) > 0.01f)
            {
                hasInput = true;
                // Normalize scroll delta because new Input System scroll values are larger
                HandleMouseZoom(Mathf.Clamp(scrollDelta, -1f, 1f));
            }
        }
#endif

        mIsBeingTouched = hasInput;

        if (!mIsBeingTouched)
        {
            HandleIdleRotation();
        }
    }

    private void HandleIdleRotation()
    {
        if (useIdleRotation)
        {
            // Berputar perlahan di sumbu Y (up)
            transform.Rotate(Vector3.up, idleRotationSpeed * Time.deltaTime, Space.Self);
        }
    }

    private void HandleRotation()
    {
        if (Touch.activeTouches.Count == 0) return;
        Touch touch = Touch.activeTouches[0];

        if (touch.phase == TouchPhase.Moved)
        {
            float xRot = touch.delta.x * rotationSpeed;
            float yRot = touch.delta.y * rotationSpeed;

            // Rotasi horizontal (Y axis) dan vertikal (X axis)
            transform.Rotate(Vector3.up, -xRot, Space.World);
            transform.Rotate(Vector3.right, yRot, Space.World);
        }
    }

    private void HandleZoom()
    {
        if (Touch.activeTouches.Count < 2) return;
        Touch touch0 = Touch.activeTouches[0];
        Touch touch1 = Touch.activeTouches[1];

        if (touch0.phase == TouchPhase.Moved || touch1.phase == TouchPhase.Moved)
        {
            Vector2 prevPos0 = touch0.screenPosition - touch0.delta;
            Vector2 prevPos1 = touch1.screenPosition - touch1.delta;

            float prevDistance = (prevPos0 - prevPos1).magnitude;
            float currentDistance = (touch0.screenPosition - touch1.screenPosition).magnitude;

            float delta = currentDistance - prevDistance;
            ApplyZoom(delta * zoomSpeed);
        }
    }

#if UNITY_EDITOR || UNITY_STANDALONE
    private void HandleMouseRotation(Mouse mouse)
    {
        Vector2 currentMousePos = mouse.position.ReadValue();
        Vector2 deltaPosition = currentMousePos - mLastMousePosition;
        mLastMousePosition = currentMousePos;

        float xRot = deltaPosition.x * rotationSpeed;
        float yRot = deltaPosition.y * rotationSpeed;

        transform.Rotate(Vector3.up, -xRot, Space.World);
        transform.Rotate(Vector3.right, yRot, Space.World);
    }

    private void HandleMouseZoom(float scrollAmount)
    {
        // Scroll in new input system is much larger, already clamped to -1 to 1 in Update
        ApplyZoom(scrollAmount * zoomSpeed * 50f); 
    }
#endif

    private void ApplyZoom(float zoomAmount)
    {
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

