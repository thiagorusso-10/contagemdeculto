import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

export function DebugBar() {
    const { user, role, assignedCampusId, loading: authLoading } = useAuth();
    const { campuses, preachers, volunteerAreas, loading: storeLoading } = useStore();
    const [expanded, setExpanded] = useState(false);

    if (!expanded) {
        return (
            <div
                onClick={() => setExpanded(true)}
                className="fixed bottom-0 left-0 bg-red-600 text-white text-xs px-2 py-1 cursor-pointer z-50 font-mono opacity-50 hover:opacity-100"
            >
                DEBUG MODE
            </div>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 w-full bg-black text-green-400 p-4 z-50 font-mono text-xs border-t-4 border-red-500 max-h-[50vh] overflow-auto">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-white text-lg">DIAGNÓSTICO DO SISTEMA</h3>
                <button onClick={() => setExpanded(false)} className="text-red-500 font-bold border border-red-500 px-2 hover:bg-red-900">
                    FECHAR
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h4 className="text-white border-b border-gray-700 mb-1">AUTH CONTEXT</h4>
                    <p>User ID: {user?.id || 'NULO'}</p>
                    <p>Email: {user?.email || 'NULO'}</p>
                    <p>Role (State): <span className="text-yellow-300">{role || 'NULO'}</span></p>
                    <p>Campus ID: {assignedCampusId || 'NULO'}</p>
                    <p>Loading: {authLoading ? 'SIM' : 'NÃO'}</p>
                </div>

                <div>
                    <h4 className="text-white border-b border-gray-700 mb-1">STORE CONTEXT</h4>
                    <p>Campuses: {campuses.length} (First: {campuses[0]?.name || 'N/A'})</p>
                    <p>Preachers: {preachers.length}</p>
                    <p>Volunteer Areas: {volunteerAreas.length}</p>
                    <p>Loading: {storeLoading ? 'SIM' : 'NÃO'}</p>
                </div>
            </div>
        </div>
    );
}
