
import { useEffect, useRef, useState } from "react";
import { Camera, UserCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../components/common/Button.jsx";
import Card from "../../components/common/Card.jsx";
import Input from "../../components/common/Input.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { updateUserProfile, uploadUserAvatar } from "../../services/userService.js";

export default function Profile() {
  const { profile, firebaseUser } = useAuth();
  const fileInputRef = useRef(null);
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUploadProgress, setAvatarUploadProgress] = useState(0);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [avatarFile]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setCollege(profile.college || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);

    try {
      await updateUserProfile(firebaseUser.uid, { name, college, bio });
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(error.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  }

  function handleAvatarSelection(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file for your profile photo.");
      return;
    }
    if (file.size >= 2 * 1024 * 1024) {
      toast.error("Profile photos must be smaller than 2 MB.");
      return;
    }

    setAvatarFile(file);
  }

  async function handleAvatarUpload() {
    if (!avatarFile || !firebaseUser?.uid) return;

    setUploadingAvatar(true);
    setAvatarUploadProgress(0);
    try {
      await uploadUserAvatar(firebaseUser.uid, avatarFile, setAvatarUploadProgress);
      setAvatarFile(null);
      toast.success("Profile photo updated.");
    } catch (error) {
      toast.error(error.message || "Unable to upload profile photo.");
    } finally {
      setUploadingAvatar(false);
      setAvatarUploadProgress(0);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.4fr,0.8fr]">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-glow">
        <h1 className="text-3xl font-semibold text-white">Your profile</h1>
        <p className="mt-3 text-slate-400">Manage your account details and view your progress.</p>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          {avatarPreview || profile?.photoURL ? (
            <img
              src={avatarPreview || profile.photoURL}
              alt="Profile"
              className="h-20 w-20 rounded-full border border-white/10 object-cover"
            />
          ) : (
            <UserCircle2 size={80} className="text-slate-500" />
          )}
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarSelection}
              className="hidden"
            />
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                <Camera size={16} />
                Choose photo
              </Button>
              {avatarFile && (
                <Button
                  type="button"
                  onClick={handleAvatarUpload}
                  loading={uploadingAvatar}
                >
                  Upload photo
                </Button>
              )}
            </div>
            <p className="text-xs text-slate-500">JPG, PNG, GIF, or another image format. Maximum size: 2 MB.</p>
            {uploadingAvatar && (
              <p role="status" className="text-sm text-slate-300">
                Uploading profile photo: {avatarUploadProgress}%
              </p>
            )}
          </div>
        </div>
        <form onSubmit={handleSave} className="mt-8 space-y-6">
          <Input label="Full name" value={name} onChange={(event) => setName(event.target.value)} required />
          <Input label="College" value={college} onChange={(event) => setCollege(event.target.value)} />
          <Input label="Bio" textarea value={bio} onChange={(event) => setBio(event.target.value)} />
          <Button type="submit" loading={saving}>Save profile</Button>
        </form>
      </div>
      <Card className="space-y-4 p-8">
        <h2 className="text-xl font-semibold text-white">Account summary</h2>
        <div className="space-y-3 text-sm text-slate-400">
          <p><span className="text-white">Username:</span> @{profile?.username || "Not set"}</p>
          <p><span className="text-white">Email:</span> {firebaseUser?.email || "Not available"}</p>
          <p><span className="text-white">Role:</span> {profile?.role || "User"}</p>
          <p><span className="text-white">Joined:</span> {profile?.createdAt ? new Date(profile.createdAt.seconds * 1000).toLocaleDateString() : "Unknown"}</p>
        </div>
      </Card>
    </div>
  );
}
