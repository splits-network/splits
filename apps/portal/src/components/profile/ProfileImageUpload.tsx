"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { ButtonLoading } from "@splits-network/shared-ui";

interface ProfileImageUploadProps {
    currentImageUrl?: string;
    onImageUpdate: (newImageUrl: string | null) => void;
}

export default function ProfileImageUpload({
    currentImageUrl,
    onImageUpdate,
}: ProfileImageUploadProps) {
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
            if (!token) {
                throw new Error("Authentication required");
            }

            const client = createAuthenticatedClient(token);

            const formData = new FormData();
            formData.append("file", file);

            const uploadResponse = await client.post<{ data: any }>(
                "/documents/profile-image",
                formData,
            );

            const document = uploadResponse?.data;
            if (!document?.public_url) {
                throw new Error("Invalid response from upload service");
            }

            const updateResponse = await client.patch("/users/profile-image", {
                profile_image_url: document.public_url,
                profile_image_path: document.file_path,
            });

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
            if (!token) {
                throw new Error("Authentication required");
            }

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
        <div className="flex flex-col items-center gap-3">
            {/* Avatar */}
            <label
                htmlFor="profile-image-upload"
                className={`relative w-24 h-24 rounded-full overflow-hidden bg-base-200 border-2 border-base-300 ${isLoading ? "pointer-events-none" : "cursor-pointer"} group`}
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt="Profile"
                        className="w-full h-full object-contain"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <i className="fa-duotone fa-regular fa-user text-3xl text-base-content/30"></i>
                    </div>
                )}

                {/* Hover overlay */}
                {!isLoading && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <i className="fa-duotone fa-regular fa-camera text-white text-xl"></i>
                    </div>
                )}

                {/* Loading spinner */}
                {isLoading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="loading loading-spinner loading-sm text-white"></span>
                    </div>
                )}
            </label>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {showDeleteConfirm ? (
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-base-content/60">Remove?</span>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="btn btn-xs btn-error"
                        >
                            <ButtonLoading
                                loading={deleting}
                                text="Yes"
                                loadingText="Removing..."
                            />
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isLoading}
                            className="btn btn-xs btn-ghost"
                        >
                            No
                        </button>
                    </div>
                ) : (
                    <>
                        <label
                            htmlFor="profile-image-upload"
                            className={`btn btn-xs btn-ghost ${isLoading ? "btn-disabled" : ""}`}
                        >
                            {imageUrl ? "Change" : "Upload"}
                        </label>
                        {imageUrl && (
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={isLoading}
                                className="btn btn-xs btn-ghost text-error"
                            >
                                Remove
                            </button>
                        )}
                    </>
                )}
            </div>

            <p className="text-xs text-base-content/40">
                JPG, PNG or WebP. Max 5MB.
            </p>

            <input
                id="profile-image-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                disabled={isLoading}
                className="hidden"
            />
        </div>
    );
}
