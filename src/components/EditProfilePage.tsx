import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  User, 
  Mail, 
  Phone, 
  Save, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  Loader,
  Camera,
  Trash2,
  Edit3,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

function EditProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    emergencyContact: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [originalData, setOriginalData] = useState({
    fullName: '',
    email: '',
    phone: '',
    emergencyContact: ''
  });

  useEffect(() => {
    if (user) {
      const userData = {
        fullName: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        emergencyContact: user.emergency_contact || ''
      };
      setFormData({
        ...userData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setOriginalData(userData);
      
      // Load existing profile picture if available
      loadProfilePicture();
    }
  }, [user]);

  const loadProfilePicture = async () => {
    if (!user?.id) return;
    
    try {
      // Check if user has a profile picture in Supabase storage
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .list(user.id, {
          limit: 1,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.log('No profile picture found or error:', error);
        return;
      }

      if (data && data.length > 0) {
        const { data: urlData } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(`${user.id}/${data[0].name}`);
        
        if (urlData?.publicUrl) {
          setProfilePicture(urlData.publicUrl);
        }
      }
    } catch (error) {
      console.error('Error loading profile picture:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setProfilePictureFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setProfilePicture(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    
    setError('');
  };

  const uploadProfilePicture = async (): Promise<string | null> => {
    if (!profilePictureFile || !user?.id) return null;

    setIsUploadingImage(true);
    try {
      // Delete existing profile picture first
      await supabase.storage
        .from('profile-pictures')
        .remove([`${user.id}/profile.jpg`, `${user.id}/profile.png`, `${user.id}/profile.jpeg`]);

      // Upload new profile picture
      const fileExt = profilePictureFile.name.split('.').pop();
      const fileName = `profile.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, profilePictureFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      return urlData?.publicUrl || null;
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      setError(`Failed to upload profile picture: ${error.message}`);
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeProfilePicture = async () => {
    if (!user?.id) return;

    try {
      // Remove from storage
      await supabase.storage
        .from('profile-pictures')
        .remove([`${user.id}/profile.jpg`, `${user.id}/profile.png`, `${user.id}/profile.jpeg`]);

      setProfilePicture(null);
      setProfilePictureFile(null);
      setError('');
      setSuccess('Profile picture removed successfully');
    } catch (error: any) {
      console.error('Error removing profile picture:', error);
      setError(`Failed to remove profile picture: ${error.message}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const hasChanges = () => {
    return (
      formData.fullName !== originalData.fullName ||
      formData.email !== originalData.email ||
      formData.phone !== originalData.phone ||
      formData.emergencyContact !== originalData.emergencyContact ||
      (showPasswordSection && formData.newPassword) ||
      profilePictureFile !== null
    );
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.emergencyContact.trim()) {
      setError('Emergency contact is required');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Phone validation (basic)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      setError('Please enter a valid phone number');
      return false;
    }

    // Password validation if changing password
    if (showPasswordSection) {
      if (!formData.currentPassword) {
        setError('Current password is required to change password');
        return false;
      }
      if (!formData.newPassword) {
        setError('New password is required');
        return false;
      }
      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters long');
        return false;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        return false;
      }
    }

    return true;
  };

  const testDatabaseConnection = async () => {
    try {
      console.log('🔍 Testing database connection...');
      
      // Test basic connection
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user?.id)
        .limit(1);

      if (testError) {
        console.error('❌ Database connection test failed:', testError);
        throw new Error(`Database connection failed: ${testError.message}`);
      }

      console.log('✅ Database connection test successful');
      return true;
    } catch (error: any) {
      console.error('❌ Database connection error:', error);
      setError(`Database connection failed: ${error.message}`);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      console.log('🚀 Starting profile update process...');
      console.log('👤 Current user:', {
        id: user?.id,
        email: user?.email,
        full_name: user?.full_name
      });
      
      // Test database connection first
      const connectionOk = await testDatabaseConnection();
      if (!connectionOk) {
        return;
      }

      // Check if Supabase is properly configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        setError('Database not configured. Please set up Supabase connection.');
        return;
      }

      console.log('📋 Form data to update:', {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        emergencyContact: formData.emergencyContact
      });

      // Upload profile picture first if there's a new one
      let profilePictureUrl = null;
      if (profilePictureFile) {
        console.log('📸 Uploading profile picture...');
        profilePictureUrl = await uploadProfilePicture();
        if (!profilePictureUrl && profilePictureFile) {
          // If upload failed, don't continue with profile update
          return;
        }
        console.log('✅ Profile picture uploaded:', profilePictureUrl);
      }

      // Prepare update data
      const updateData: any = {
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        emergency_contact: formData.emergencyContact.trim(),
        updated_at: new Date().toISOString()
      };

      // Add profile picture URL if uploaded
      if (profilePictureUrl) {
        updateData.profile_picture_url = profilePictureUrl;
      }

      console.log('💾 Updating user profile in database...');
      console.log('📋 Update data:', updateData);
      console.log('🎯 Updating user with ID:', user?.id);

      // Update profile information in users table
      const { data: updateResult, error: profileError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user?.id)
        .select('*'); // Select all fields to get the updated data back

      console.log('📊 Database update response:', {
        data: updateResult,
        error: profileError
      });

      if (profileError) {
        console.error('❌ Profile update error:', profileError);
        setError(`Failed to update profile: ${profileError.message}`);
        return;
      }

      if (!updateResult || updateResult.length === 0) {
        console.error('❌ No data returned from update - user might not exist');
        setError('Failed to update profile: User not found in database');
        return;
      }

      console.log('✅ Profile updated successfully in database');
      console.log('📋 Updated user data:', updateResult[0]);

      // Update email in auth if changed
      if (formData.email !== originalData.email) {
        console.log('📧 Updating email in authentication system...');
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email.trim()
        });

        if (emailError) {
          console.error('❌ Email update error:', emailError);
          setError(`Profile updated but email change failed: ${emailError.message}`);
          return;
        }
        console.log('✅ Email updated in authentication system');
      }

      // Update password if requested
      if (showPasswordSection && formData.newPassword) {
        console.log('🔐 Updating password...');
        
        // Verify current password by attempting to sign in
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: user?.email || '',
          password: formData.currentPassword
        });

        if (verifyError) {
          console.error('❌ Current password verification failed:', verifyError);
          setError('Current password is incorrect');
          return;
        }

        // Update password
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword
        });

        if (passwordError) {
          console.error('❌ Password update error:', passwordError);
          setError(`Profile updated but password change failed: ${passwordError.message}`);
          return;
        }
        
        console.log('✅ Password updated successfully');
      }

      // Update local state with new values
      const newData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        emergencyContact: formData.emergencyContact
      };

      setOriginalData(newData);

      // Clear password fields and file
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setShowPasswordSection(false);
      setProfilePictureFile(null);

      setSuccess('✅ Profile updated successfully! All changes have been saved to the database.');
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);

      console.log('🎉 Profile update process completed successfully');

      // Refresh the page to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error('❌ Profile update failed:', error);
      setError(`Update failed: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data including route history and emergency contacts.'
    );

    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      'This is your final warning. Deleting your account will permanently remove all your data. Type "DELETE" in the next prompt to confirm.'
    );

    if (!doubleConfirm) return;

    const deleteConfirmation = window.prompt('Type "DELETE" to confirm account deletion:');
    
    if (deleteConfirmation !== 'DELETE') {
      alert('Account deletion cancelled. You must type "DELETE" exactly to confirm.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🗑️ Deleting user account...');
      
      // Delete profile picture from storage
      if (user?.id) {
        await supabase.storage
          .from('profile-pictures')
          .remove([`${user.id}/profile.jpg`, `${user.id}/profile.png`, `${user.id}/profile.jpeg`]);
      }
      
      // Delete user data from our tables (this will cascade due to foreign key constraints)
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user?.id);

      if (deleteError) {
        console.error('❌ Account deletion error:', deleteError);
        setError(`Failed to delete account: ${deleteError.message}`);
        return;
      }

      // Sign out the user
      await logout();
      
      alert('Your account has been successfully deleted. You will now be redirected to the home page.');
      navigate('/');
      
    } catch (error: any) {
      console.error('❌ Account deletion failed:', error);
      setError(`Account deletion failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 2) return 'bg-yellow-500';
    if (strength <= 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 1) return 'Weak';
    if (strength <= 2) return 'Fair';
    if (strength <= 3) return 'Good';
    return 'Strong';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Navigation Header */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ShaktiPath
              </span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/map" 
                className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
              >
                Back to Map
              </Link>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Overview Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="relative">
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto">
                      <User className="h-12 w-12 text-white" />
                    </div>
                  )}
                  
                  {/* Profile Picture Actions */}
                  <div className="absolute bottom-0 right-0 flex space-x-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      title="Change profile picture"
                    >
                      {isUploadingImage ? (
                        <Loader className="h-4 w-4 text-gray-600 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4 text-gray-600" />
                      )}
                    </button>
                    
                    {profilePicture && (
                      <button
                        onClick={removeProfilePicture}
                        className="bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-red-50 transition-colors"
                        title="Remove profile picture"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-1">{user.full_name}</h2>
              <p className="text-gray-600 mb-4">{user.email}</p>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{user.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Emergency Contact:</span>
                  <span className="font-medium">{user.emergency_contact}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="font-medium">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Image Upload Tips */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex items-center justify-center space-x-1">
                    <ImageIcon className="h-3 w-3" />
                    <span>JPG, PNG up to 5MB</span>
                  </div>
                  <p>Click camera icon to upload</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                  className="flex items-center justify-center space-x-2 text-red-600 hover:text-red-700 font-medium transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center space-x-3 mb-8">
                <Edit3 className="h-6 w-6 text-purple-600" />
                <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
              </div>

              {/* Success/Error Messages */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-green-700 text-sm">{success}</span>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                          placeholder="Enter your full name"
                          required
                          disabled={isSaving}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                          placeholder="Enter your email"
                          required
                          disabled={isSaving}
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                          placeholder="Enter your phone number"
                          required
                          disabled={isSaving}
                        />
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div>
                      <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Shield className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          id="emergencyContact"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                          placeholder="Emergency contact number"
                          required
                          disabled={isSaving}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Security</h3>
                    <button
                      type="button"
                      onClick={() => setShowPasswordSection(!showPasswordSection)}
                      className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
                    >
                      {showPasswordSection ? 'Cancel Password Change' : 'Change Password'}
                    </button>
                  </div>

                  {showPasswordSection && (
                    <div className="space-y-4">
                      {/* Current Password */}
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            id="currentPassword"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                            placeholder="Enter current password"
                            disabled={isSaving}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            disabled={isSaving}
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* New Password */}
                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            New Password *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              id="newPassword"
                              name="newPassword"
                              value={formData.newPassword}
                              onChange={handleChange}
                              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                              placeholder="Enter new password"
                              disabled={isSaving}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              disabled={isSaving}
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                              ) : (
                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                              )}
                            </button>
                          </div>
                          
                          {/* Password Strength Indicator */}
                          {formData.newPassword && (
                            <div className="mt-2">
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(getPasswordStrength(formData.newPassword))}`}
                                    style={{ width: `${(getPasswordStrength(formData.newPassword) / 4) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-600">
                                  {getPasswordStrengthText(getPasswordStrength(formData.newPassword))}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              id="confirmPassword"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                              placeholder="Confirm new password"
                              disabled={isSaving}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              disabled={isSaving}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                              ) : (
                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                              )}
                            </button>
                          </div>
                          
                          {/* Password Match Indicator */}
                          {formData.confirmPassword && (
                            <div className="mt-2">
                              {formData.newPassword === formData.confirmPassword ? (
                                <div className="flex items-center space-x-2 text-green-600">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="text-xs">Passwords match</span>
                                </div>
                              ) : (
                                <div className="text-xs text-red-600">Passwords don't match</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={!hasChanges() || isSaving}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader className="animate-spin h-5 w-5" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                  
                  <Link
                    to="/map"
                    className="flex-1 border-2 border-purple-600 text-purple-600 py-3 px-6 rounded-lg font-semibold hover:bg-purple-600 hover:text-white transition-all duration-200 text-center"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showImagePreview && profilePicture && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Profile Picture Preview</h3>
              <button
                onClick={() => setShowImagePreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <img
              src={profilePicture}
              alt="Profile Preview"
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default EditProfilePage;