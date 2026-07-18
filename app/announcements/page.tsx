"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Copy, Megaphone, Send, ExternalLink, RefreshCw, Upload, X } from "lucide-react";
import { apiService } from "@/lib/api";

export default function AnnouncementsPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        message: "",
        buttonText: "",
        buttonUrl: "",
        target: "channel" as "channel" | "group" | "self",
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Clean up object URL on unmount or when image changes
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);

            const url = URL.createObjectURL(file);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(url);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        // Also reset the file input if possible, but state is enough for now
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await apiService.sendAnnouncement({
                message: formData.message,
                imageFile: imageFile || undefined,
                buttonText: formData.buttonText || undefined,
                buttonUrl: formData.buttonUrl || undefined,
                target: formData.target,
            });
            setSuccess("Announcement sent successfully!");
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Failed to send announcement. Process failed."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
                    <p className="text-gray-500 mt-2">
                        Create and send announcements to your Telegram community.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Form Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-blue-600">
                            <Megaphone className="w-5 h-5 text-blue-600" />
                            Compose Message
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Target Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Target Destination
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { value: "channel", label: "Channel" },
                                        { value: "group", label: "Group" },
                                        { value: "self", label: "Test (Me)" },
                                    ].map((option) => (
                                        <label
                                            key={option.value}
                                            className={`
                        relative flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors
                        ${formData.target === option.value
                                                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500 text-blue-700"
                                                    : "border-gray-200 text-gray-700"
                                                }
                      `}
                                        >
                                            <input
                                                type="radio"
                                                name="target"
                                                value={option.value}
                                                checked={formData.target === option.value}
                                                onChange={handleChange}
                                                className="sr-only"
                                            />
                                            <span className="font-medium">{option.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Message Text
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={6}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Enter your announcement details..."
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Attach Image (Optional)
                                </label>
                                {!imageFile ? (
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                            <p className="text-xs text-gray-500">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                PNG, JPG (MAX. 5MB)
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                ) : (
                                    <div className="relative group">
                                        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                            <div className="w-10 h-10 relative overflow-hidden rounded bg-gray-200">
                                                {previewUrl && (
                                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {imageFile.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="p-1 hover:bg-red-100 rounded-full transition-colors text-gray-400 hover:text-red-500"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Button Conf */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Button Text (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="buttonText"
                                        value={formData.buttonText}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="e.g. Join Now"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Button URL (Optional)
                                    </label>
                                    <input
                                        type="url"
                                        name="buttonUrl"
                                        value={formData.buttonUrl}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            {/* Status Messages */}
                            {error && (
                                <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="p-4 rounded-lg bg-green-50 text-green-700 text-sm">
                                    {success}
                                </div>
                            )}

                            {/* Submit Action */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Send Announcement
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Preview Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Copy className="w-5 h-5 text-gray-500" />
                            Preview
                        </h2>

                        <div className="bg-[#8c9eff] bg-opacity-10 p-4 rounded-xl border border-[#8c9eff]/20 max-w-sm mx-auto md:mx-0">
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden max-w-[320px]">
                                {/* Image Preview */}
                                {previewUrl ? (
                                    <div className="relative h-48 w-full bg-gray-100">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : null}

                                {/* Text Content */}
                                <div className="p-4 space-y-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
                                            BOT
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-blue-600">Bingo Bot</div>
                                            <div className="text-xs text-gray-400">just now</div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                        {formData.message || "Your message will appear here..."}
                                    </p>
                                </div>

                                {/* Inline Button */}
                                {formData.buttonText && (
                                    <div className="px-4 pb-4">
                                        <a
                                            href="#"
                                            className="block w-full py-2 text-center text-blue-500 font-medium text-sm bg-blue-50 rounded bg-opacity-50 hover:bg-opacity-70 transition"
                                            onClick={(e) => e.preventDefault()}
                                        >
                                            {formData.buttonText}
                                            <ExternalLink className="w-3 h-3 inline ml-1 align-top opacity-50" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Note</h3>
                            <p className="text-sm text-gray-600">
                                This is a simulated preview with your local file. The file will be uploaded to the server when you click send.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
