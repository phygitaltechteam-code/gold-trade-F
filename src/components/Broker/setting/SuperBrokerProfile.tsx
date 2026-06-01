import React, {useEffect, useState} from 'react';
import {Database} from 'lucide-react';
import {useGetComission} from '@/lib/react-query/commission';
import {
  useEditProfile,
  useGetProfile,
  useResetPassword,
  useResetPin,
} from '@/lib/react-query/admin';
import {set} from 'lodash';
import {
  useEditSuperBrokerProfile,
  useGetSuperbrokerProfile,
} from '@/lib/react-query/superbrocker';
import {useAuthContext} from '@/context/AuthContext';

const SuperBrokerProfile = () => {
  const {user} = useAuthContext();

  const [fullname, setFullname] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [existingPhoto, setExistingPhoto] = useState<string>('');
  const {data: profile} = useGetSuperbrokerProfile();
  const {mutate: editProfile} = useEditSuperBrokerProfile();

  // Set name and existing photo from profile data
  useEffect(() => {
    if (profile?.data) {
      if (profile.data.fullname) {
        setFullname(profile.data.fullname);
      }
      if (profile.data.photo) {
        setExistingPhoto(profile.data.photo);
        setPreview(profile.data.photo);
      }
    } else if (profile && profile.fullname) {
      // Fallback if data is not nested
      setFullname(profile.fullname);
      if (profile.photo) {
        setExistingPhoto(profile.photo);
        setPreview(profile.photo);
      }
    } else if (user && user.fullname) {
      setFullname(user.fullname);
    }
  }, [profile, user]);

  // Preview selected image (overrides existing photo when new one is selected)
  useEffect(() => {
    if (photo) {
      const objectUrl = URL.createObjectURL(photo);
      setPreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [photo]);

  const profileEdit = () => {
    const formData = new FormData();

    if (fullname) {
      formData.append('fullname', fullname);
    }

    if (photo) {
      formData.append('photo', photo);
    }

    editProfile({
      data: {
        fullname,
        photo: photo || undefined,
      },
    });
  };

  return (
    <>
      <div className="font-sans min-h-screen bg-[#F8F9FA] text-[#1A1A1A]">
        <main className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <section className="overflow-hidden rounded-xl border border-stroke bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-stroke sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold sm:text-lg">
                  Profile
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-3 sm:gap-6 sm:py-6 lg:gap-8">
              <div className="space-y-2">
                <label className="text-gray-500 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
                  Name
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={fullname}
                    disabled
                    className="bg-gray-50 text-gray-500 w-full cursor-not-allowed rounded-lg border border-stroke px-3 py-1 text-xs font-medium sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-gray-500 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
                  Username
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={
                      profile?.data?.username ||
                      profile?.username ||
                      user?.username ||
                      ''
                    }
                    disabled
                    className="bg-gray-50 text-gray-500 w-full cursor-not-allowed rounded-lg border border-stroke px-3 py-1 text-xs font-medium sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-gray-500 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
                  Email
                </label>

                <div className="relative">
                  <input
                    type="email"
                    value={
                      profile?.data?.email ||
                      profile?.email ||
                      user?.email ||
                      ''
                    }
                    disabled
                    className="bg-gray-50 text-gray-500 w-full cursor-not-allowed rounded-lg border border-stroke px-3 py-1 text-xs font-medium sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-gray-500 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
                  Phone Number
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={
                      profile?.data?.phoneNumber ||
                      profile?.phoneNumber ||
                      user?.phoneNumber ||
                      ''
                    }
                    disabled
                    className="bg-gray-50 text-gray-500 w-full cursor-not-allowed rounded-lg border border-stroke px-3 py-1 text-xs font-medium sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-gray-500 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
                  Broker ID
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={profile?.data?.BKId || profile?.BKId || ''}
                    disabled
                    className="bg-gray-50 text-gray-500 w-full cursor-not-allowed rounded-lg border border-stroke px-3 py-1 text-xs font-medium sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-gray-500 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
                  Role
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={profile?.data?.role || profile?.role || ''}
                    disabled
                    className="bg-gray-50 text-gray-500 w-full cursor-not-allowed rounded-lg border border-stroke px-3 py-1 text-xs font-medium sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
                  />
                </div>
              </div>

              {/* <div className="space-y-2">
                <label className="text-gray-500 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
                  Photo
                </label>

                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setPhoto(e.target.files[0]);
                      }
                    }}
                    className="w-full rounded-lg border border-stroke bg-white px-3 py-1 text-xs font-medium outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
                  />
                </div>
              </div> */}

              {/* <div className="space-y-2">
                <label className="text-gray-500 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
                  Preview
                </label>
                {preview ? (
                  <div className="flex items-center">
                    <img
                      src={preview}
                      alt="Profile Preview"
                      className="h-20 w-20 rounded-xl border object-cover shadow-sm"
                    />
                  </div>
                ) : (
                  <div className="bg-gray-50 text-gray-400 flex h-20 w-20 items-center justify-center rounded-xl border border-stroke">
                    No image
                  </div>
                )}
              </div> */}
            </div>

            {/* <div className="flex justify-end">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-[#F27D26] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#E06D1F]"
                onClick={profileEdit}
              >
                <Database className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div> */}
          </section>
        </main>
      </div>
    </>
  );
};

export default SuperBrokerProfile;
