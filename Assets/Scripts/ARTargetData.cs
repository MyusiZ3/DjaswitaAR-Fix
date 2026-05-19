using System;

[Serializable]
public class ARTargetData
{
    public string id;
    public string nama;
    public string type; // target / event / trip
    public string deskripsi;
    public string harga;
    public string marker_url;
    public string slide_urls;
    public string video_url;
    public string media_type; // image / video
    public string booking_url;
    public string start_date;
    public string end_date;
    public string duration;
    public string booking_start;
    public string booking_end;

    // 3D Model support
    public string main_content_type; // image_slides / 3d_model
    public string model_url;
    public float model_scale;
    public float model_pos_y;
    public float model_pos_z;
    public float model_rot_y;
}
