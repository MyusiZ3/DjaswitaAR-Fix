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

        // Daftar shader yang wajib ada di Android agar 3D Model glTFast bisa muncul di URP
        string[] shadersToAdd = new string[]
        {
            "Universal Render Pipeline/Lit",
            "Universal Render Pipeline/Unlit",
            "Universal Render Pipeline/Simple Lit",
            "glTF/PbrMetallicRoughness",
            "glTF/Unlit"
        };

        bool changed = false;

        foreach (string shaderName in shadersToAdd)
        {
            Shader shader = Shader.Find(shaderName);
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
                Debug.Log("[ShaderStrippingFix] Added " + shaderName + " to Always Included Shaders.");
            }
        }

        if (changed)
        {
            serializedObject.ApplyModifiedProperties();
            AssetDatabase.SaveAssets();
            Debug.Log("[ShaderStrippingFix] Successfully updated GraphicsSettings to prevent 3D models from becoming invisible on Android!");
        }
    }
}
