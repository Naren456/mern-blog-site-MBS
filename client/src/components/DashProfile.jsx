import { Alert, Button, Modal, TextInput } from 'flowbite-react';
import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  updateStart,
  updateSuccess,
  updateFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signoutSuccess,
} from '../redux/user/userSlice';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { Link } from 'react-router-dom';

export default function DashProfile() {
  const { currentUser, error, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);


  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  const filePickerRef = useRef();

  const toggleEdit = () => {
    if (isEditing) handleSubmit(new Event('submit'));
    setIsEditing(!isEditing);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  const uploadImage = async () => {
    setImageFileUploading(true);
    setImageFileUploadError(null);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageFileUploadProgress(progress.toFixed(0));
      },
      (error) => {
        setImageFileUploadError('Could not upload image (max 2MB)');
        setImageFileUploadProgress(null);
        setImageFile(null);
        setImageFileUrl(null);
        setImageFileUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setFormData({ ...formData, profilePicture: downloadURL });
          setImageFileUploading(false);
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateUserError(null);
    setUpdateUserSuccess(null);
    if (Object.keys(formData).length === 0) {
      setUpdateUserError('No changes made');
      return;
    }
    if (imageFileUploading) {
      setUpdateUserError('Please wait for image to upload');
      return;
    }
    try {
      dispatch(updateStart());
      const res = await fetch(`api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(updateFailure(data.message));
        setUpdateUserError(data.message);
      } else {
        dispatch(updateSuccess(data));
        setUpdateUserSuccess("User's profile updated successfully");
      }
    } catch (err) {
      dispatch(updateFailure(err.message));
      setUpdateUserError(err.message);
    }
  };

  const handleChangePassword = async () => {
  setPasswordError(null);
  setPasswordSuccess(null);
  
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    setPasswordError('All fields are required');
    return;
  }
  
  if (newPassword !== confirmNewPassword) {
    setPasswordError("New password and confirm password don't match");
    return;
  }
  
  try {
    const res = await fetch('http://localhost:3000/api/user/change-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', 
  body: JSON.stringify({ currentPassword, newPassword }),
});

    const data = await res.json();

    if (!res.ok) {
      setPasswordError(data.message);
    } else {
      setPasswordSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowPasswordModal(false);
    }
  } catch (err) {
    setPasswordError(err.message);
  }
};

  const handleDeleteUser = async () => {
    setShowDeleteModal(false);
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) dispatch(deleteUserFailure(data.message));
      else dispatch(deleteUserSuccess(data));
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
    }
  };

  const handleSignout = async () => {
    try {
      const res = await fetch('/api/user/signout', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) console.log(data.message);
      else dispatch(signoutSuccess());
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <div className='max-w-lg mx-auto p-3 w-full'>
      <h1 className='my-7 text-center font-semibold text-3xl'>Profile</h1>
      <button
        type="button"
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition mb-4"
        onClick={toggleEdit}
      >
        {isEditing ? "Save" : "Edit"}
      </button>

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input type='file' accept='image/*' onChange={handleImageChange} ref={filePickerRef} hidden />
        <div
          className='relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full'
          onClick={() => filePickerRef.current.click()}
        >
          {imageFileUploadProgress && (
            <CircularProgressbar value={imageFileUploadProgress} text={`${imageFileUploadProgress}%`} />
          )}
          <img
            src={imageFileUrl || currentUser.profilePicture}
            alt='user'
            className='rounded-full w-full h-full object-cover border-8 border-[lightgray]'
          />
        </div>

        <TextInput id='username' defaultValue={currentUser.username} onChange={handleChange} readOnly={!isEditing} />
        <TextInput id='email' defaultValue={currentUser.email} onChange={handleChange} readOnly={!isEditing} />

        {currentUser.isAdmin && (
          <Link to='/create-post'>
            <Button type='button' gradientDuoTone='purpleToPink' className='w-full'>Create a post</Button>
          </Link>
        )}
      </form>

      <div className='flex justify-between mt-5 gap-2'>
        <Button color='failure' onClick={() => setShowDeleteModal(true)}>Delete Account</Button>
        <Button color='light' onClick={handleSignout}>Sign Out</Button>
        <Button color='purple' onClick={() => setShowPasswordModal(true)}>Change Password</Button>
      </div>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} popup size='md'>
        <Modal.Header />
        <Modal.Body>
          <div className='text-center'>
            <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 mb-4 mx-auto' />
            <h3 className='mb-5 text-lg text-gray-500'>Are you sure you want to delete your account?</h3>
            <div className='flex justify-center gap-4'>
              <Button color='failure' onClick={handleDeleteUser}>Yes, I'm sure</Button>
              <Button color='gray' onClick={() => setShowDeleteModal(false)}>No, cancel</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Change Password Modal */}
      <Modal show={showPasswordModal} onClose={() => setShowPasswordModal(false)} popup size='md'>
        <Modal.Header />
        <Modal.Body>
          <div className='flex flex-col gap-4'>
            <TextInput type='password' placeholder='Current Password' value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            <TextInput type='password' placeholder='New Password' value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <TextInput type='password' placeholder='Confirm New Password' value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
            {passwordError && <Alert color='failure'>{passwordError}</Alert>}
            {passwordSuccess && <Alert color='success'>{passwordSuccess}</Alert>}
            <Button color='purple' onClick={handleChangePassword}>Change Password</Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
