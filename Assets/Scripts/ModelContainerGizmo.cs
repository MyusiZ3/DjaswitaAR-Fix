using UnityEngine;

/// <summary>
/// Visualizer untuk 3D_Model_Container di Unity Editor.
/// Menggambar gizmo wireframe di scene view agar posisi & scale bisa dilihat.
/// Script ini TIDAK mempengaruhi build/runtime sama sekali.
/// 
/// Cara pakai:
/// 1. Attach script ini ke GameObject "3D_Model_Container"
/// 2. Gizmo otomatis muncul di scene view
/// 3. Adjust Scale di admin dashboard, lalu lihat perubahannya lewat ARTargetHandler test
/// </summary>
public class ModelContainerGizmo : MonoBehaviour
{
    [Header("Gizmo Settings")]
    [Tooltip("Warna wireframe gizmo di scene view")]
    public Color gizmoColor = new Color(0f, 1f, 0.5f, 0.8f);

    [Tooltip("Tampilkan juga gizmo sumbu (axis arrows)")]
    public bool showAxes = true;

    [Tooltip("Ukuran label teks (untuk referensi scale saat ini)")]
    public bool showLabel = true;

    // Ukuran cube gizmo — merepresentasikan 1 unit di local space container
    private const float CUBE_SIZE = 1f;

#if UNITY_EDITOR
    private void OnDrawGizmos()
    {
        Gizmos.matrix = transform.localToWorldMatrix;

        // Wireframe box — keliatan tapi tidak solid
        Gizmos.color = gizmoColor;
        Gizmos.DrawWireCube(Vector3.zero, Vector3.one * CUBE_SIZE);

        // Inner box kecil untuk titik center
        Gizmos.color = new Color(gizmoColor.r, gizmoColor.g, gizmoColor.b, 0.15f);
        Gizmos.DrawCube(Vector3.zero, Vector3.one * CUBE_SIZE * 0.05f);

        // Reset matrix untuk gambar axes di world space
        if (showAxes)
        {
            Gizmos.matrix = Matrix4x4.identity;

            float axisLen = transform.lossyScale.magnitude * 0.6f;

            // X axis = merah
            Gizmos.color = new Color(1f, 0.2f, 0.2f, 0.9f);
            Gizmos.DrawLine(transform.position, transform.position + transform.right * axisLen);

            // Y axis = hijau
            Gizmos.color = new Color(0.2f, 1f, 0.2f, 0.9f);
            Gizmos.DrawLine(transform.position, transform.position + transform.up * axisLen);

            // Z axis = biru
            Gizmos.color = new Color(0.2f, 0.5f, 1f, 0.9f);
            Gizmos.DrawLine(transform.position, transform.position + transform.forward * axisLen);
        }
    }

    private void OnDrawGizmosSelected()
    {
        // Saat dipilih: tampil solid semi-transparan + label
        Gizmos.matrix = transform.localToWorldMatrix;
        Gizmos.color = new Color(gizmoColor.r, gizmoColor.g, gizmoColor.b, 0.08f);
        Gizmos.DrawCube(Vector3.zero, Vector3.one * CUBE_SIZE);

        // Label info scale
        if (showLabel)
        {
            Gizmos.matrix = Matrix4x4.identity;
            UnityEditor.Handles.Label(
                transform.position + Vector3.up * (transform.lossyScale.y * 0.7f),
                $"[3D Container]\nScale: {transform.localScale.x:F4}\nPos Y: {transform.localPosition.y:F4}\nPos Z: {transform.localPosition.z:F4}",
                new GUIStyle()
                {
                    normal = { textColor = gizmoColor },
                    fontSize = 10,
                    fontStyle = FontStyle.Bold
                }
            );
        }
    }
#endif
}
