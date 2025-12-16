
import React from "react";

export default function ActivityFeed({ data = [] }) {
  if (!data.length) {
    return <div className="p-4 text-gray-500">No recent account activity</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="px-3 py-2 text-left">Time</th>
            <th className="px-3 py-2 text-left">Type</th>
            <th className="px-3 py-2 text-left">Details</th>
            <th className="px-3 py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.map(evt => (
            <tr key={evt.id} className="border-b hover:bg-gray-50">
              <td className="px-3 py-2">{new Date(evt.timestamp).toLocaleString()}</td>
              <td className="px-3 py-2">{evt.type}</td>
              <td className="px-3 py-2">{evt.description}</td>
              <td className="px-3 py-2 text-right">
                {evt.amount !== undefined ? `$${evt.amount.toFixed(2)}` : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
