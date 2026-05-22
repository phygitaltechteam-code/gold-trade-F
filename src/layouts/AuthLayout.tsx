import {Outlet, useNavigate} from '@tanstack/react-router';
import MenuBook from '../assets/images/logo/Menubook.png';
import React, {useEffect} from 'react';
import {useAuthContext} from '@/context/AuthContext';

const AuthLayout = () => {
  const navigate = useNavigate();
  const {isAuthenticated} = useAuthContext();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (isAuthenticated || token) {
      navigate({to: '/dashboard'});
    }
  }, [isAuthenticated, token, navigate]);

  // If authenticated, don't render the auth layout (will redirect)
  if (isAuthenticated || token) {
    return null;
  }

  return (
    // <div className="flex h-screen w-screen flex-col items-center justify-center rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
    //   <div className="flex w-full items-center justify-center xl:w-1/2">
    //     <div className="w-[70vh] bg-white p-4 shadow-md sm:p-12.5 xl:p-17.5">
    <Outlet />
    //     </div>
    //   </div>
    // </div>
  );
};

export default AuthLayout;
