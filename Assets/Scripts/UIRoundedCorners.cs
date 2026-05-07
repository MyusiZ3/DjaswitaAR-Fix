using UnityEngine;
using UnityEngine.UI;

[ExecuteInEditMode]
[RequireComponent(typeof(RectTransform))]
public class UIRoundedCorners : MonoBehaviour, IMeshModifier
{
    [Range(0, 100)]
    public float radius = 20f;
    
    [Range(4, 64)]
    public int segments = 16;

    private Graphic mGraphic;

    private void OnEnable()
    {
        mGraphic = GetComponent<Graphic>();
        if (mGraphic != null) mGraphic.SetVerticesDirty();
    }

    private void OnDisable()
    {
        if (mGraphic != null) mGraphic.SetVerticesDirty();
    }

    private void Update()
    {
        if (!Application.isPlaying && mGraphic != null)
        {
            mGraphic.SetVerticesDirty();
        }
    }

    public void ModifyMesh(Mesh mesh)
    {
        using (var vh = new VertexHelper(mesh))
        {
            ModifyMesh(vh);
            vh.FillMesh(mesh);
        }
    }

    public void ModifyMesh(VertexHelper vh)
    {
        Rect rect = GetComponent<RectTransform>().rect;
        vh.Clear();

        float r = Mathf.Min(radius, Mathf.Min(rect.width / 2f, rect.height / 2f));
        if (r < 0) r = 0;

        // Center of the graphic
        Vector2 centerPoint = rect.center;
        vh.AddVert(new Vector3(centerPoint.x, centerPoint.y, 0), Color.white, new Vector2(0.5f, 0.5f));
        int centerIdx = 0;

        // Add vertices for rounded corners
        AddCorner(vh, rect, new Vector2(rect.x + r, rect.y + r), r, 180, 270); // BL
        AddCorner(vh, rect, new Vector2(rect.xMax - r, rect.y + r), r, 270, 360); // BR
        AddCorner(vh, rect, new Vector2(rect.xMax - r, rect.yMax - r), r, 0, 90); // TR
        AddCorner(vh, rect, new Vector2(rect.x + r, rect.yMax - r), r, 90, 180); // TL

        // Add triangles
        int count = vh.currentVertCount;
        for (int i = 1; i < count; i++)
        {
            int next = (i + 1 == count) ? 1 : i + 1;
            vh.AddTriangle(centerIdx, i, next);
        }
    }

    private void AddCorner(VertexHelper vh, Rect rect, Vector2 center, float r, float startAngle, float endAngle)
    {
        int cornerSegments = segments / 4;
        for (int i = 0; i <= cornerSegments; i++)
        {
            float angle = (startAngle + (i * (endAngle - startAngle) / cornerSegments)) * Mathf.Deg2Rad;
            Vector2 pos = center + new Vector2(Mathf.Cos(angle), Mathf.Sin(angle)) * r;
            
            // Calculate UV based on position in rect
            Vector2 uv = new Vector2(
                (pos.x - rect.x) / rect.width,
                (pos.y - rect.y) / rect.height
            );
            
            vh.AddVert(new Vector3(pos.x, pos.y, 0), Color.white, uv);
        }
    }
}
