import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // Redux hooks
import { createGroupAction , joinGroupAction } from '../../store/slices/groupSlices';
import { Users, PlusCircle, LogIn, Loader2 } from 'lucide-react';

const GroupManager = () => {
    const [isJoining, setIsJoining] = useState(false);
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.group); // Global loading state

    const [formData, setFormData] = useState({
        groupName: '',
        groupUniqueId: '',
        groupPassword: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isJoining) {
            dispatch(joinGroupAction(formData));
        } else {
            dispatch(createGroupAction(formData));
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-[2.5rem] shadow-xl border border-gray-100">
            {/* ... Icon aur Heading same rahenge ... */}

            <form onSubmit={handleSubmit} className="space-y-4">
                {!isJoining && (
                    <input
                        type="text"
                        placeholder="Group Name (e.g. Rambo Boys)"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-indigo-300 transition-all"
                        onChange={(e) => setFormData({...formData, groupName: e.target.value})}
                        required
                    />
                )}
                <input
                    type="text"
                    placeholder="Unique Group ID"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-indigo-300 transition-all"
                    onChange={(e) => setFormData({...formData, groupUniqueId: e.target.value})}
                    required
                />
                <input
                    type="password"
                    placeholder="Group Password"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-indigo-300 transition-all"
                    onChange={(e) => setFormData({...formData, groupPassword: e.target.value})}
                    required
                />

                <button
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100 disabled:bg-indigo-300"
                >
                    {loading ? <Loader2 className="animate-spin" /> : (isJoining ? <LogIn size={20}/> : <PlusCircle size={20}/>)}
                    {isJoining ? "Join Group" : "Create Group"}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button 
                    onClick={() => setIsJoining(!isJoining)}
                    className="text-indigo-600 font-black text-sm hover:underline"
                >
                    {isJoining ? "Naya Group Banana Hai? Create Karein" : "Pehle se group hai? Join Karein"}
                </button>
            </div>
        </div>
    );
};

export default GroupManager;