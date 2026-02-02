"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

interface ProfileImageUploadProps {
    currentImageUrl?: string;
    onImageUpdate: (newImageUrl: string) => void;
}

export default function ProfileImageUpload({
    currentImageUrl,
    onImageUpdate,
}: ProfileImageUploadProps) {
    const { getToken } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState(currentImageUrl);

    const handleFileSelect = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            // 5MB limit
            alert("Image must be less than 5MB");
            return;
        }

        setUploading(true);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error("Authentication required");
            }

            const client = createAuthenticatedClient(token);

            // Upload to document service using multipart form
            const formData = new FormData();
            formData.append("file", file);

            // Note: We need to use fetch directly for multipart uploads
            // because the API client doesn't support FormData properly
            const uploadResponse = await fetch(
                "http://localhost:3000/api/v2/documents/profile-image",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                },
            );

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json().catch(() => ({}));
                throw new Error(
                    errorData?.error?.message || "Failed to upload image",
                );
            }

            const { data: document } = await uploadResponse.json();

            // Update user profile with new image URL using API client
            const updateResponse = await client.patch("/users/profile-image", {
                profile_image_url:
                    document.metadata?.public_url || document.public_url,
                profile_image_path: document.file_path,
            });

            // API client automatically unwraps { data } responses
            if (updateResponse?.data) {
                const newImageUrl = updateResponse.data.profile_image_url;
                setImageUrl(newImageUrl);
                onImageUpdate(newImageUrl);
            } else {
                throw new Error("Failed to update profile image");
            }
        } catch (error) {
            console.error("Error uploading profile image:", error);
            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to update profile image. Please try again.",
            );
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="avatar">
                <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt="Profile"
                            width={128}
                            height={128}
                            className="rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center w-full h-full bg-base-200 rounded-full">
                            <i className="fa-duotone fa-regular fa-user text-4xl text-base-content/60"></i>
                        </div>
                    )}
                </div>
            </div>

            <label
                htmlFor="profile-image-upload"
                className="btn btn-outline btn-sm"
            >
                {uploading ? (
                    <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Uploading...
                    </>
                ) : (
                    <>
                        <i className="fa-duotone fa-regular fa-camera"></i>
                        Change Photo
                    </>
                )}
            </label>

            <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
            />
        </div>
    );
}
