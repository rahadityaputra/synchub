import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../stores/useStore";
import {
  ArrowLeft,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Package,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const STATUS_OPTIONS = ["ACTIVE", "DRAFT", "ARCHIVED"];
const CATEGORY_OPTIONS = [
  "Accessories",
  "Beauty",
  "Books",
  "Electronics",
  "Fashion",
  "Food",
  "Home",
  "Office",
  "Smartphone",
  "Sports",
  "Stationery",
  "Other",
];

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-blue-500";

const emptyForm = {
  name: "",
  internalSku: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  stock: "",
  weight: "",
  status: "ACTIVE",
};

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const {
    fetchProductDetail,
    createProduct,
    updateProduct,
    uploadProductImages,
  } = useStore();

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [imageItems, setImageItems] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const imageItemsRef = useRef([]);

  useEffect(() => {
    imageItemsRef.current = imageItems;
  }, [imageItems]);

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      if (!isEditMode) {
        setLoading(false);
        setForm(emptyForm);
        setImageItems([]);
        return;
      }

      setLoading(true);
      const detail = await fetchProductDetail(id);

      if (!active) return;

      const product = detail?.product || detail;
      const nextImages = Array.isArray(product?.images) ? product.images : [];

      setForm({
        name: product?.name || "",
        internalSku: product?.internalSku || product?.sku || "",
        description: product?.description || "",
        category: product?.category || "",
        brand: product?.brand || "",
        price: product?.price !== undefined ? String(product.price) : "",
        stock: product?.stock !== undefined ? String(product.stock) : "",
        weight: product?.weight !== undefined ? String(product.weight) : "",
        status: product?.status || "ACTIVE",
      });

      setImageItems(
        nextImages.map((url) => ({
          id: url,
          type: "existing",
          url,
        })),
      );
      setLoading(false);
    };

    loadProduct();

    return () => {
      active = false;
    };
  }, [fetchProductDetail, id, isEditMode]);

  useEffect(
    () => () => {
      imageItemsRef.current.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    },
    [],
  );

  const categoryOptions = useMemo(() => {
    return Array.from(
      new Set([...CATEGORY_OPTIONS, form.category].filter(Boolean)),
    );
  }, [form.category]);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateAndAppendFiles = (fileList) => {
    const selectedFiles = Array.from(fileList || []);
    if (selectedFiles.length === 0) return;

    setErrors((prev) => ({ ...prev, image: "" }));

    const totalImages = imageItemsRef.current.length + selectedFiles.length;
    if (totalImages > MAX_IMAGES) {
      setErrors((prev) => ({
        ...prev,
        image: `Maksimal ${MAX_IMAGES} gambar per produk.`,
      }));
      return;
    }

    const nextItems = [];
    for (const file of selectedFiles) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          image: "Format hanya boleh JPG, JPEG, PNG, atau WEBP.",
        }));
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        setErrors((prev) => ({
          ...prev,
          image: "Ukuran gambar maksimal 5MB per file.",
        }));
        continue;
      }

      nextItems.push({
        id: makeId(),
        type: "new",
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setImageItems((prev) => [...prev, ...nextItems]);
  };

  const handleFileChange = (event) => {
    validateAndAppendFiles(event.target.files);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    validateAndAppendFiles(event.dataTransfer.files);
  };

  const handleRemoveImage = (itemId) => {
    setImageItems((prev) => {
      const target = prev.find((item) => item.id === itemId);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== itemId);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});

    const payloadErrors = {};
    const nextForm = {
      name: form.name.trim(),
      internalSku: form.internalSku.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      brand: form.brand.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      weight: Number(form.weight),
      status: form.status,
    };

    if (!nextForm.name) payloadErrors.name = "Nama produk wajib diisi.";
    if (!nextForm.internalSku) payloadErrors.internalSku = "SKU wajib diisi.";
    if (!nextForm.category) payloadErrors.category = "Kategori wajib dipilih.";
    if (!nextForm.brand) payloadErrors.brand = "Brand wajib diisi.";
    if (!isEditMode && !nextForm.description)
      payloadErrors.description = "Deskripsi produk wajib diisi.";
    if (Number.isNaN(nextForm.price))
      payloadErrors.price = "Harga harus berupa angka.";
    if (Number.isNaN(nextForm.stock))
      payloadErrors.stock = "Stok harus berupa angka.";
    if (Number.isNaN(nextForm.weight)) {
      payloadErrors.weight = "Weight harus berupa angka.";
    } else if (nextForm.weight < 1) {
      payloadErrors.weight = "Weight minimal 1 gram.";
    }

    if (Object.keys(payloadErrors).length > 0) {
      setErrors(payloadErrors);
      return;
    }

    const existingImages = imageItems
      .filter((item) => item.type === "existing")
      .map((item) => item.url);
    const newFiles = imageItems
      .filter((item) => item.type === "new")
      .map((item) => item.file);

    if (existingImages.length + newFiles.length === 0) {
      setErrors({ image: "Minimal 1 gambar produk." });
      return;
    }

    if (existingImages.length + newFiles.length > MAX_IMAGES) {
      setErrors({ image: `Maksimal ${MAX_IMAGES} gambar per produk.` });
      return;
    }

    setSaving(true);

    try {
      let uploadedImages = [];

      if (newFiles.length > 0) {
        setUploading(true);
        setUploadProgress(0);
        uploadedImages = await uploadProductImages(newFiles, setUploadProgress);

        if (uploadedImages.length !== newFiles.length) {
          setErrors({ image: "Sebagian gambar gagal diunggah. Coba lagi." });
          return;
        }
      }

      const payload = {
        name: nextForm.name,
        internalSku: nextForm.internalSku,
        internal_sku: nextForm.internalSku,
        description: nextForm.description,
        category: nextForm.category,
        brand: nextForm.brand,
        price: nextForm.price,
        stock: nextForm.stock,
        weight: nextForm.weight,
        status: nextForm.status,
        images: [...existingImages, ...uploadedImages],
      };

      const result = isEditMode
        ? await updateProduct(id, payload)
        : await createProduct(payload);
      const nextId = result?.id || id;

      if (nextId) {
        navigate(`/products/${nextId}`);
      } else {
        navigate("/products");
      }
    } finally {
      setSaving(false);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-40 rounded bg-slate-800" />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-4">
            <div className="h-72 rounded-xl border border-slate-800 bg-slate-900" />
            <div className="h-72 rounded-xl border border-slate-800 bg-slate-900" />
          </div>
          <div className="h-[36rem] rounded-xl border border-slate-800 bg-slate-900" />
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            to={isEditMode ? `/products/${id}` : "/products"}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
          >
            <ArrowLeft size={16} />
            {isEditMode
              ? "Kembali ke detail produk"
              : "Kembali ke daftar produk"}
          </Link>
          <h1 className="text-xl font-bold text-white">
            {isEditMode ? "Edit Produk" : "Tambah Produk Baru"}
          </h1>
          <p className="text-xs text-slate-400">
            {isEditMode
              ? "Perbarui data produk, gambar, status, dan stok."
              : "Buat produk baru dengan deskripsi, gambar, dan data inventori yang realistis."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              navigate(isEditMode ? `/products/${id}` : "/products")
            }
            className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-900"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {isEditMode ? "Simpan Perubahan" : "Simpan Produk"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="glass-panel rounded-xl p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-blue-400" />
              <h2 className="text-sm font-semibold text-white">
                Informasi Produk
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Product Name" error={errors.name}>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => setField("name", event.target.value)}
                  placeholder="iPhone 15 Pro"
                  className={INPUT_CLASS}
                />
              </Field>

              <Field label="Internal SKU" error={errors.internalSku}>
                <input
                  type="text"
                  value={form.internalSku}
                  onChange={(event) =>
                    setField("internalSku", event.target.value.toUpperCase())
                  }
                  placeholder="IPH15PRO-BLK"
                  className={`${INPUT_CLASS} font-mono uppercase`}
                />
              </Field>

              <Field label="Category" error={errors.category}>
                <select
                  value={form.category}
                  onChange={(event) => setField("category", event.target.value)}
                  className={INPUT_CLASS}
                >
                  <option value="">Pilih kategori</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Brand" error={errors.brand}>
                <input
                  type="text"
                  value={form.brand}
                  onChange={(event) => setField("brand", event.target.value)}
                  placeholder="Apple"
                  className={INPUT_CLASS}
                />
              </Field>

              <Field label="Price" error={errors.price}>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(event) => setField("price", event.target.value)}
                  placeholder="18000000"
                  className={INPUT_CLASS}
                />
              </Field>

              <Field label="Stock" error={errors.stock}>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(event) => setField("stock", event.target.value)}
                  placeholder="15"
                  className={INPUT_CLASS}
                />
              </Field>

              <Field label="Weight (gram)" error={errors.weight}>
                <input
                  type="number"
                  min="1"
                  value={form.weight}
                  onChange={(event) => setField("weight", event.target.value)}
                  placeholder="200"
                  className={INPUT_CLASS}
                />
              </Field>

              <Field label="Status" error={errors.status}>
                <select
                  value={form.status}
                  onChange={(event) => setField("status", event.target.value)}
                  className={INPUT_CLASS}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Description"
                error={errors.description}
                className="md:col-span-2"
              >
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(event) =>
                    setField("description", event.target.value)
                  }
                  required={!isEditMode}
                  placeholder="Apple flagship smartphone dengan detail yang jelas untuk tim operasional dan marketplace."
                  className={`${INPUT_CLASS} resize-none`}
                />
              </Field>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Upload size={18} className="text-blue-400" />
              <h2 className="text-sm font-semibold text-white">
                Product Images
              </h2>
            </div>

            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-slate-800 bg-slate-950/60"
              }`}
            >
              <div className="mx-auto flex max-w-md flex-col items-center gap-3 text-slate-400">
                <div className="rounded-full border border-slate-800 bg-slate-900 p-3 text-blue-400">
                  <ImageIcon size={22} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Drag & drop gambar produk di sini
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    JPG, JPEG, PNG, atau WEBP. Maksimal 5 gambar, 5MB per file.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                >
                  <Plus size={14} />
                  Pilih Gambar
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {errors.image ? (
              <p className="text-xs font-medium text-red-400">{errors.image}</p>
            ) : null}

            {uploading ? (
              <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Mengunggah gambar...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
              {imageItems.length === 0 ? (
                <div className="col-span-full rounded-lg border border-slate-800 bg-slate-950 p-6 text-center text-xs text-slate-500">
                  Belum ada gambar produk.
                </div>
              ) : (
                imageItems.map((item) => (
                  <div
                    key={item.id}
                    className="group relative overflow-hidden rounded-lg border border-slate-800 bg-slate-950"
                  >
                    <img
                      src={
                        item.type === "existing" ? item.url : item.previewUrl
                      }
                      alt="Product preview"
                      className="h-32 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(item.id)}
                      className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                    <div className="border-t border-slate-800 px-2 py-1 text-[10px] text-slate-400">
                      {item.type === "existing" ? "Uploaded" : "Pending upload"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Upload Rules</h2>
            </div>

            <div className="space-y-3 text-xs text-slate-400">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <div className="font-semibold text-white">Allowed formats</div>
                <p className="mt-1">JPG, JPEG, PNG, dan WEBP.</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <div className="font-semibold text-white">Limit</div>
                <p className="mt-1">
                  Minimal 1 gambar dan maksimal {MAX_IMAGES} gambar per produk.
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <div className="font-semibold text-white">Size</div>
                <p className="mt-1">Maksimal 5MB untuk setiap file.</p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Trash2 size={18} className="text-blue-400" />
              <h2 className="text-sm font-semibold text-white">
                Submission Flow
              </h2>
            </div>

            <ol className="space-y-2 text-xs text-slate-400">
              <li className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                1. Validasi form dan image rules.
              </li>
              <li className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                2. Upload image ke endpoint upload.
              </li>
              <li className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                3. Kirim URL gambar saat create/update produk.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </form>
  );
}

function Field({ label, error, className = "", children }) {
  return (
    <label className={`space-y-1.5 ${className}`}>
      <span className="text-xs font-semibold text-slate-400">{label}</span>
      {children}
      {error ? <span className="text-[11px] text-red-400">{error}</span> : null}
    </label>
  );
}

export default ProductForm;
