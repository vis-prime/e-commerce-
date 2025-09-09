"use client"
import React, { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

const UploadProduct: React.FC = () => {
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [price, setPrice] = useState(10)
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setLoading(true)
    try {
      // Insert DB row
      const { data: inserted, error: insertError } = await supabase
        .from("products")
        .insert({
          name,
          description: desc,
          price,
        })
        .select()
      if (insertError) throw insertError
      if (inserted && inserted.length > 0) {
        const product = inserted[0]

        // Upload files to fixed names
        if (modelFile) {
          await supabase.storage
            .from("productStorage")
            .upload(`${product.id}/model.glb`, modelFile, { upsert: true })
        }
        if (thumbnailFile) {
          await supabase.storage
            .from("productStorage")
            .upload(`${product.id}/thumb.webp`, thumbnailFile, { upsert: true })
        }

        setMessage("✅ Product uploaded successfully!")
      } else {
        setMessage("⚠️ Upload failed.")
      }
    } catch (err: any) {
      setMessage("❌ Error uploading product: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-8 border rounded-lg bg-background border-border">
      <h2 className="text-2xl font-semibold mb-6 text-foreground">
        Upload Product
      </h2>
      <form onSubmit={handleSubmit}>
        {/* Name */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
          className="mb-4 w-full px-3 py-2 border rounded-md bg-card text-foreground border-input"
        />

        {/* Description */}
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Description"
          rows={3}
          required
          className="mb-4 w-full px-3 py-2 border rounded-md bg-card text-foreground border-input"
        />

        {/* Price */}
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          placeholder="Price"
          required
          className="mb-4 w-full px-3 py-2 border rounded-md bg-card text-foreground border-input"
        />

        {/* Model Upload */}
        <input
          type="file"
          onChange={(e) => setModelFile(e.target.files?.[0] || null)}
          className="mb-4 block w-full text-foreground file:bg-primary file:text-primary-foreground file:rounded-md"
        />

        {/* Thumbnail Upload */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
          className="mb-4 block w-full text-foreground file:bg-primary file:text-primary-foreground file:rounded-md"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground"
        >
          {loading ? "Uploading..." : "Upload Product"}
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  )
}

const UpdateProduct: React.FC = () => {
  const [uuid, setUuid] = useState("")
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [price, setPrice] = useState(10)
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [thumbUrl, setThumbUrl] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleFetch = async () => {
    setMessage("")
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("products")
        .select("name, description, price")
        .eq("id", uuid)
        .single()

      if (error) throw error
      if (data) {
        setName(data.name)
        setDesc(data.description || "")
        setPrice(data.price || 0)

        // Build file URLs
        setModelUrl(
          supabase.storage
            .from("productStorage")
            .getPublicUrl(`${uuid}/model.glb`).data.publicUrl
        )
        setThumbUrl(
          supabase.storage
            .from("productStorage")
            .getPublicUrl(`${uuid}/thumb.webp`).data.publicUrl
        )

        setMessage("✅ Product fetched successfully!")
      }
    } catch (err: any) {
      setMessage("❌ Error fetching product: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setLoading(true)

    try {
      // Upload new files if provided
      if (modelFile) {
        await supabase.storage
          .from("productStorage")
          .upload(`${uuid}/model.glb`, modelFile, { upsert: true })
      }
      if (thumbnailFile) {
        await supabase.storage
          .from("productStorage")
          .upload(`${uuid}/thumb.webp`, thumbnailFile, { upsert: true })
      }

      // Update DB row
      const { error: updateError } = await supabase
        .from("products")
        .update({ name, description: desc, price })
        .eq("id", uuid)

      if (updateError) throw updateError
      setMessage("✅ Product updated successfully!")
    } catch (err: any) {
      setMessage("❌ Error updating product: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-8 border rounded-lg bg-background border-border">
      <h2 className="text-2xl font-semibold mb-6 text-foreground">
        Update Product
      </h2>

      {/* Fetch form */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={uuid}
          onChange={(e) => setUuid(e.target.value)}
          placeholder="Enter Product UUID"
          className="flex-1 px-3 py-2 border rounded-md bg-card text-foreground border-input"
        />
        <button
          type="button"
          onClick={handleFetch}
          disabled={!uuid || loading}
          className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground"
        >
          Fetch
        </button>
      </div>

      {/* Update form */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
          className="mb-4 w-full px-3 py-2 border rounded-md bg-card text-foreground border-input"
        />

        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Description"
          rows={3}
          required
          className="mb-4 w-full px-3 py-2 border rounded-md bg-card text-foreground border-input"
        />

        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          placeholder="Price"
          required
          className="mb-4 w-full px-3 py-2 border rounded-md bg-card text-foreground border-input"
        />

        <input
          type="file"
          onChange={(e) => setModelFile(e.target.files?.[0] || null)}
          className="mb-4 block w-full text-foreground file:bg-primary file:text-primary-foreground file:rounded-md"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
          className="mb-4 block w-full text-foreground file:bg-primary file:text-primary-foreground file:rounded-md"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground"
        >
          {loading ? "Updating..." : "Update Product"}
        </button>
      </form>

      {/* Preview existing files */}
      {modelUrl && (
        <a href={modelUrl} target="_blank" className="block mt-4 text-blue-500">
          View Model
        </a>
      )}
      {thumbUrl && (
        <img src={thumbUrl} alt="Thumbnail" className="w-24 h-24 mt-2" />
      )}

      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  )
}

const UploadUpdatePage: React.FC = () => {
  const [mode, setMode] = useState<"upload" | "update">("upload")
  return (
    <div>
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setMode("upload")}
          className={`px-4 py-2 rounded-md ${
            mode === "upload"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          Upload
        </button>
        <button
          onClick={() => setMode("update")}
          className={`px-4 py-2 rounded-md ${
            mode === "update"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          Update
        </button>
      </div>
      {mode === "upload" ? <UploadProduct /> : <UpdateProduct />}
    </div>
  )
}

export default UploadUpdatePage
