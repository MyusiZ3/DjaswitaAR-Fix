using UnityEditor;
using UnityEngine;

[InitializeOnLoad]
public class ShaderStrippingFix
{
    static ShaderStrippingFix()
    {
        AddShadersToAlwaysIncluded();
    }

    [MenuItem("Tools/Djaswita/Fix Android 3D Shaders")]
    public static void AddShadersToAlwaysIncluded()
    {
        var graphicsSettingsObj = AssetDatabase.LoadAllAssetsAtPath("ProjectSettings/GraphicsSettings.asset");
        if (graphicsSettingsObj == null || graphicsSettingsObj.Length == 0) return;

        SerializedObject serializedObject = new SerializedObject(graphicsSettingsObj[0]);
        SerializedProperty arrayProp = serializedObject.FindProperty("m_AlwaysIncludedShaders");

        bool changed = false;

        // 1. BERSIHKAN SHADER BERAT & SHADER SALAH (MENCEGAH BUILD 3 JAM)
        string[] badShaders = new string[]
        {
            "Universal Render Pipeline/Lit",
            "glTF/PbrMetallicRoughness",
            "glTF/Unlit"
        };

        for (int i = arrayProp.arraySize - 1; i >= 0; i--)
        {
            var element = arrayProp.GetArrayElementAtIndex(i);
            Shader s = element.objectReferenceValue as Shader;
            if (s != null && System.Array.Exists(badShaders, bad => bad == s.name))
            {
                element.objectReferenceValue = null;
                arrayProp.DeleteArrayElementAtIndex(i);
                changed = true;
                Debug.Log("[ShaderStrippingFix] Dihapus shader berat/salah: " + s.name);
            }
        }

        // 2. DAFTAR SHADER GLTF YANG BENAR (GLTFAST & GLTFUTILITY)
        string[] requiredShaderNames = new string[]
        {
            // GLTFast URP shaders
            "Shader Graphs/glTF-unlit",
            "Shader Graphs/glTF-pbrMetallicRoughness",
            "Shader Graphs/glTF-pbrSpecularGlossiness",
            "Shader Graphs/URP/glTF-pbrMetallicRoughness-Clearcoat",
            
            // GLTFUtility built-in shaders (wajib agar tidak crash NullReferenceException di Android)
            "GLTFUtility/Standard (Metallic)",
            "GLTFUtility/Standard (Specular)",
            "GLTFUtility/Standard Transparent (Metallic)",
            "GLTFUtility/Standard Transparent (Specular)",
            
            // Fallback URP (Aman untuk build cepat tapi mencegah model invisible)
            "Universal Render Pipeline/Simple Lit"
        };

        foreach (string requiredShader in requiredShaderNames)
        {
            Shader shader = Shader.Find(requiredShader);
            if (shader == null) continue;

            bool found = false;
            for (int i = 0; i < arrayProp.arraySize; i++)
            {
                if (arrayProp.GetArrayElementAtIndex(i).objectReferenceValue == shader)
                {
                    found = true;
                    break;
                }
            }

            if (!found)
            {
                int newIndex = arrayProp.arraySize;
                arrayProp.InsertArrayElementAtIndex(newIndex);
                arrayProp.GetArrayElementAtIndex(newIndex).objectReferenceValue = shader;
                changed = true;
                Debug.Log("[ShaderStrippingFix] Menambahkan " + requiredShader + " ke Always Included Shaders.");
            }
        }

        if (changed)
        {
            serializedObject.ApplyModifiedProperties();
            AssetDatabase.SaveAssets();
            Debug.Log("[ShaderStrippingFix] Berhasil membersihkan shader berat dan memasukkan shader glTFast URP yang benar!");
        }
    }
}
