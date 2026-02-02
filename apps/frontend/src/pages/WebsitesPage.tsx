import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { supabase } from '@common/supabaseClient';

/**
 * WebsitesPage lists the user's monitored websites and allows them to add
 * new ones.  It uses React Query to fetch data from Supabase.  The
 * monitor_check function should be called from the backend to check the
 * status of each website.  At this stage we only display the URLs and
 * provide a form to add new entries.
 */
export default function WebsitesPage() {
  const queryClient = useQueryClient();
  const [newUrl, setNewUrl] = useState('');

  // Fetch websites for the logged in user
  const { data: websites, isLoading, error } = useQuery(['websites'], async () => {
    const { data, error } = await supabase.from('websites').select('*').order('created_at');
    if (error) throw error;
    return data;
  });

  // Mutation to add a new website
  const addWebsiteMutation = useMutation(
    async (url: string) => {
      const { error } = await supabase.from('websites').insert({ url });
      if (error) throw error;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['websites']);
        setNewUrl('');
      },
    }
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Website Monitoring</h1>
      <p className="mb-4 text-gray-700">Track the health and performance of your websites.  Use the form below to add a new URL to your watchlist.</p>
      <div className="flex mb-4">
        <input
          type="url"
          placeholder="https://example.com"
          value={newUrl}
          onChange={e => setNewUrl(e.target.value)}
          className="flex-grow p-2 border rounded-l"
        />
        <button
          onClick={() => addWebsiteMutation.mutate(newUrl)}
          className="px-4 py-2 bg-green-600 text-white rounded-r disabled:opacity-50"
          disabled={!newUrl || addWebsiteMutation.isLoading}
        >
          Add
        </button>
      </div>
      {isLoading ? (
        <p>Loading websites…</p>
      ) : error ? (
        <p className="text-red-500">Error: {error.message}</p>
      ) : (
        <ul className="space-y-2">
          {websites?.map(site => (
            <li key={site.id} className="p-2 border rounded flex justify-between items-center">
              <span>{site.url}</span>
              {/* Placeholder for status.  In a full implementation you would
                  fetch the latest status from the monitor_check function. */}
              <span className="text-sm text-gray-500">{site.status ?? 'N/A'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}