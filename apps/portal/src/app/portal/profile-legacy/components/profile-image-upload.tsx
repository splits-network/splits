"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { Button } from "@splits-network/memphis-ui";

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

    // Extract initials from image URL or use default
    const getInitials = () => {
        return "U";
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Avatar */}
            <label
                htmlFor="profile-image-upload"
                className={`relative w-28 h-28 border-4 border-coral overflow-hidden ${isLoading ? "pointer-events-none opacity-60" : "cursor-pointer"} group`}
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-coral">
                        <span className="text-4xl font-black text-white">
                            {getInitials()}
                        </span>
                    </div>
                )}

                {/* Hover overlay */}
                {!isLoading && (
                    <div className="absolute inset-0 bg-dark/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <i className="fa-duotone fa-regular fa-camera text-white text-2xl"></i>
                    </div>
                )}

                {/* Loading spinner */}
                {isLoading && (
                    <div className="absolute inset-0 bg-dark/80 flex items-center justify-center">
                        <div className="w-6 h-6 border-4 border-white border-t-transparent animate-spin"></div>
                    </div>
                )}
            </label>

            {/* Actions */}
            <div className="flex items-center gap-3">
                {showDeleteConfirm ? (
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-dark/60 font-bold">Remove?</span>
                        <Button
                            color="coral"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isLoading}
                        >
                            {deleting ? (
                                <>
                                    <i className="fa-duotone fa-regular fa-spinner-third fa-spin text-xs"></i>
                                    Removing...
                                </>
                            ) : (
                                "Yes"
                            )}
                        </Button>
                        <Button
                            color="dark"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isLoading}
                        >
                            No
                        </Button>
                    </div>
                ) : (
                    <>
                        <label
                            htmlFor="profile-image-upload"
                            className={`${isLoading ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={isLoading}
                            >
                                {uploading ? (
                                    <>
                                        <i className="fa-duotone fa-regular fa-spinner-third fa-spin text-xs"></i>
                                        Uploading...
                                    </>
                                ) : imageUrl ? (
                                    "Change"
                                ) : (
                                    "Upload"
                                )}
                            </Button>
                        </label>
                        {imageUrl && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={isLoading}
                                className="text-coral"
                            >
                                Remove
                            </Button>
                        )}
                    </>
                )}
            </div>

            <p className="text-xs text-dark/40 font-bold text-center">
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
