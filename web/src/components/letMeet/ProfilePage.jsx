/* eslint-disable react/prop-types */
import React from 'react';

const ProfilePage = ({ userProfile, formData }) => {
  if (!userProfile) {
    return <div className="text-gray-700 text-center">Loading profile...</div>;
  }
  return (
    <div className="max-w-full mx-auto bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
      <div className="flex flex-wrap gap-4 mb-4">
        {formData.pictures.map((pic, index) => (
          <img key={index} src={pic || 'https://via.placeholder.com/100'} alt={`Profile Pic ${index + 1}`} className="w-24 h-24 rounded-full object-cover" />
        ))}
      </div>
      <p className="text-lg"><span className="font-bold">Name:</span> {userProfile.fullname}</p>
      <p className="text-lg"><span className="font-bold">Age:</span> {userProfile.age}</p>
      <p className="text-lg"><span className="font-bold">Gender:</span> {userProfile.gender}</p>
      <p className="text-lg"><span className="font-bold">Nationality:</span> {userProfile.nationality}</p>
      <p className="text-lg"><span className="font-bold">Height:</span> {formData.height}</p>
      <p className="text-lg"><span className="font-bold">Faith:</span> {formData.faith}</p>
      <p className="text-lg"><span className="font-bold">Smoke:</span> {formData.smoke}</p>
      <p className="text-lg"><span className="font-bold">Drink:</span> {formData.drink}</p>
      <p className="text-lg"><span className="font-bold">Personality:</span> {formData.personality}</p>
      <p className="text-lg"><span className="font-bold">Education:</span> {formData.education}</p>
      <p className="text-lg"><span className="font-bold">Career:</span> {formData.career}</p>
      <p className="text-lg"><span className="font-bold">Ethnicity:</span> {formData.ethnicity}</p>
    </div>
  );
};

export default ProfilePage;