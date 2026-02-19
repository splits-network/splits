"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";

interface BaselProfileImageUploadProps {
    currentImageUrl?: string;
    onImageUpdate: (newImageUrl: string | null) => void;
}

export function BaselProfileImageUpload({
    currentImageUrl,
    onImageUpdate,
}: BaselProfileImageUploadProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [imageUrl, setImageUrl] = useState(currentImageUrl);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        setImageUrl(currentImageUrl);
    }, [currentImageUrl]);

    const handleFileSelect = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be less than 5MB");
            return;
        }
        setUploading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("Authentication required");
            const client = createAuthenticatedClient(token);
            const formData = new FormData();
            formData.append("file", file);
            const uploadResponse = await client.post<{ data: any }>(
                "/documents/profile-image",
                formData,
            );
            const document = uploadResponse?.data;
            if (!document?.public_url)
                throw new Error("Invalid response from upload service");
            const updateResponse = await client.patch(
                "/users/profile-image",
                {
                    profile_image_url: document.public_url,
                    profile_image_path: document.file_path,
                },
            );
            if (updateResponse?.data) {
                const newImageUrl = updateResponse.data.profile_image_url;
                setImageUrl(newImageUrl);
                onImageUpdate(newImageUrl);
                toast.success("Profile photo updated");
            } else {
                throw new Error("Failed to update profile image");
            }
        } catch (error) {
            console.error("Error uploading profile image:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to update profile photo",
            );
        } finally {
            setUploading(false);
            event.target.value = "";
        }
    };

    const handleDelete = async () => {
        setShowDeleteConfirm(false);
        setDeleting(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("Authentication required");
            const client = createAuthenticatedClient(token);
            await client.delete("/users/profile-image");
            setImageUrl(undefined);
            onImageUpdate(null);
            toast.success("Profile photo removed");
        } catch (error) {
            console.error("Error deleting profile image:", error);
            toast.error("Failed to remove profile photo");
        } finally {
            setDeleting(false);
        }
    };

    const isLoading = uploading || deleting;

    return (
        <div className="flex items-start gap-6 pb-8 border-b border-base-300">
            <label
                htmlFor="basel-profile-image-upload"
                className={`relative w-20 h-20 overflow-hidden flex-shrink-0 ${isLoading ? "pointer-events-none opacity-60" : "cursor-pointer"} group`}
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary text-primary-content">
                        <span className="text-2xl font-black">U</span>
                    </div>
                )}
                {!isLoading && (
                    <div className="absolute inset-0 bg-neutral/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <i className="fa-duotone fa-regular fa-camera text-neutral-content text-xl" />
                    </div>
                )}
                {isLoading && (
                    <div className="absolute inset-0 bg-neutral/80 flex items-center justify-center">
                        <span className="loading loading-spinner loading-sm text-neutral-content" />
                    </div>
                )}
            </label>

            <div>
                <p className="font-bold mb-1">Profile Photo</p>
                <p className="text-sm text-base-content/40 mb-3">
                    JPG, PNG or WebP. Max 5MB.
                </p>
                <div className="flex gap-2">
                    {showDeleteConfirm ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-base-content/60 font-semibold">
                                Remove?
                            </span>
                            <button
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="btn btn-sm btn-error"
                            >
                                {deleting ? "Removing..." : "Yes"}
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isLoading}
                                className="btn btn-sm btn-ghost"
                            >
                                No
                            </button>
                        </div>
                    ) : (
                        <>
                            <label
                                htmlFor="basel-profile-image-upload"
                                className={
                                    isLoading
                                        ? "pointer-events-none opacity-50"
                                        : "cursor-pointer"
                                }
                            >
                                <span className="btn btn-sm btn-primary">
                                    {uploading
                                        ? "Uploading..."
                                        : imageUrl
                                          ? "Change"
                                          : "Upload New"}
                                </span>
                            </label>
                            {imageUrl && (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    disabled={isLoading}
                                    className="btn btn-sm btn-ghost"
                                >
                                    Remove
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            <input
                id="basel-profile-image-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                disabled={isLoading}
                className="hidden"
            />
        </div>
    );
}
