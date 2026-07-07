import React, {useEffect, useState} from 'react';
import {Database} from 'lucide-react';
import {useGetComission} from '@/lib/react-query/commission';

import {set} from 'lodash';
import { useEditProfile, useGetProfile } from '@/lib/api/masterpanelapi/profile';

const Profile = () => {
  const {data: commission} = useGetComission();
  const [fullname, setName] = useState('');
  const [photo, setphoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const {data: profile} = useGetProfile();

  const {mutate: editProfile} = useEditProfile();

  useEffect(() => {
    if (profile) {
      setName(profile.fullname);

      // existing image from backend
      if (profile.photo) {
        setPreview(profile.photo);
      }
    }
  }, [profile]);

  // preview selected image
  useEffect(() => {
    if (photo) {
      const objectUrl = URL.createObjectURL(photo);
      setPreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [photo]);
  const profileEdit = () => {
    if (!photo) return;

    editProfile({
      data: {
        fullname,
        photo,
      },
    });
  };
  console.log('commisssionnn', commission);

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
                  name
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={fullname}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-stroke bg-white px-3 py-1 text-xs font-medium outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-gray-500 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
                  photo
                </label>

                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setphoto(e.target.files[0]);
                      }
                    }}
                    className="w-full rounded-lg border border-stroke bg-white px-3 py-1 text-xs font-medium outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                {' '}
                <label className="text-gray-500 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider sm:text-xs"></label>
                {preview && (
                  <div className="flex items-center">
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-15 w-15 rounded-xl border object-cover shadow-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-[#F27D26] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#E06D1F]"
                onClick={profileEdit}
              >
                <Database className="h-4 w-4" />
                <span>Save</span>
              </button>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default Profile;
