import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import Image from "next/image";
import useChatwoot from "../hooks/useChatwoot";
import classNames from "classnames";
import { formatDistance } from "date-fns";

interface Conversation {
  id: number;
  inbox_identifier: string;
  status: string;
  assignee: { name: string } | null;
  meta: { sender: { name: string } };
  labels: string[];
  created_at: string;
}

const Home: NextPage = () => {
  const [loaded, payload, error] = useChatwoot();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);

  // Use account ID 1 by default or from payload
  const accountId = payload?.data?.conversation?.account_id || 1;
  const API_BASE = process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL || "https://suporte.amssergipe.com.br";
  const TOKEN = process.env.NEXT_PUBLIC_CHATWOOT_API_TOKEN || "";

  useEffect(() => {
    if (loaded && TOKEN) {
      fetchAllConversations();
    }
  }, [loaded, TOKEN]);

  async function fetchAllConversations(page = 1, perPage = 20, accum: Conversation[] = []) {
    setLoadingChats(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/accounts/${accountId}/conversations?page=${page}&per_page=${perPage}`,
        {
          headers: { Authorization: TOKEN },
        }
      );
      const data = await res.json();
      const all = accum.concat(data.payload);
      if (data.meta.current_page < data.meta.total_pages) {
        return fetchAllConversations(page + 1, perPage, all);
      }
      setConversations(all);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChats(false);
    }
  }

  useEffect(() => {
    console.log("Conversations loaded:", conversations.length);
  }, [conversations]);

  return (
    <main className="w-full h-screen bg-white">
      <section className="grid grid-cols-3 gap-5 bg-gray-100 border-b p-4">
        <div className="w-full">
          <h1 className="text-3xl font-bold text-gray-700">Dashboard de Tickets</h1>
        </div>
      </section>

      <section className="w-full p-4">
        {loadingChats && <p>Carregando tickets...</p>}
        {!loadingChats && conversations.length === 0 && <p>Nenhum ticket encontrado.</p>}

        {conversations.length > 0 && (
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border">ID</th>
                <th className="py-2 px-4 border">Cliente</th>
                <th className="py-2 px-4 border">Canal</th>
                <th className="py-2 px-4 border">Status</th>
                <th className="py-2 px-4 border">Etiquetas</th>
                <th className="py-2 px-4 border">Criado em</th>
                <th className="py-2 px-4 border">Responsável</th>
              </tr>
            </thead>
            <tbody>
              {conversations.map((conv) => (
                <tr key={conv.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border text-center">{conv.id}</td>
                  <td className="py-2 px-4 border">{conv.meta.sender.name}</td>
                  <td className="py-2 px-4 border text-center">{conv.inbox_identifier}</td>
                  <td className="py-2 px-4 border text-center">{conv.status}</td>
                  <td className="py-2 px-4 border">{conv.labels.join(", ")}</td>
                  <td className="py-2 px-4 border">
                    {formatDistance(new Date(conv.created_at), new Date(), { addSuffix: true })}
                  </td>
                  <td className="py-2 px-4 border">
                    {conv.assignee ? conv.assignee.name : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
};

export default Home;
