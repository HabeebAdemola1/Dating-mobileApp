/* eslint-disable react/prop-types */
import { useState } from 'react';

const AdmirersPage = ({ admirersData, handleRespondInvitation, handleUnmatch }) => {
  const [admirersSubPage, setAdmirersSubPage] = useState('pending');

  return (
    <div className="p-4">
      <div className="flex justify-around mb-4">
        <button
          onClick={() => setAdmirersSubPage('pending')}
          className={`px-4 py-2 rounded ${admirersSubPage === 'pending' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
        >
          Pending Invitations
        </button>
        <button
          onClick={() => setAdmirersSubPage('sent')}
          className={`px-4 py-2 rounded ${admirersSubPage === 'sent' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
        >
          Sent Invitations
        </button>
        <button
          onClick={() => setAdmirersSubPage('accepted')}
          className={`px-4 py-2 rounded ${admirersSubPage === 'accepted' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
        >
          Accepted Invitations
        </button>
      </div>
      {admirersSubPage === 'pending' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Pending Invitations</h2>
          {admirersData.pending.length === 0 ? (
            <p>No pending invitations</p>
          ) : (
            admirersData.pending.map((user) => (
              <div key={user.id} className="bg-white p-4 rounded shadow mb-4">
                <div className="flex items-center">
                  <img src={user.picture || 'https://via.placeholder.com/50'} alt={user.fullname} className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <p className="font-bold">{user.fullname}, {user.age}</p>
                    <p>{user.gender}, {user.nationality}</p>
                    <p>Interests: {user.interest1}, {user.interest2}</p>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleRespondInvitation(user.id, 'accept')}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespondInvitation(user.id, 'reject')}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {admirersSubPage === 'sent' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Sent Invitations</h2>
          {admirersData.sent.length === 0 ? (
            <p>No sent invitations</p>
          ) : (
            admirersData.sent.map((user) => (
              <div key={user.id} className="bg-white p-4 rounded shadow mb-4">
                <div className="flex items-center">
                  <img src={user.picture || 'https://via.placeholder.com/50'} alt={user.fullname} className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <p className="font-bold">{user.fullname}, {user.age}</p>
                    <p>{user.gender}, {user.nationality}</p>
                    <p>Interests: {user.interest1}, {user.interest2}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {admirersSubPage === 'accepted' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Accepted Invitations</h2>
          {admirersData.accepted.length === 0 ? (
            <p>No accepted invitations</p>
          ) : (
            admirersData.accepted.map((user) => (
              <div key={user.id} className="bg-white p-4 rounded shadow mb-4">
                <div className="flex items-center">
                  <img src={user.picture || 'https://via.placeholder.com/50'} alt={user.fullname} className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <p className="font-bold">{user.fullname}, {user.age}</p>
                    <p>{user.gender}, {user.nationality}</p>
                    <p>Interests: {user.interest1}, {user.interest2}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleUnmatch(user.id)}
                  className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
                >
                  Unmatch
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdmirersPage;