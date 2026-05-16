"use client";

import { useState, useRef } from "react";
import { deleteArticleAction } from "./actions";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

export function DeleteArticleButton({ id }: { id: string }) {
  const [showModal, setShowModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowModal(true);
  };

  const confirmDelete = () => {
    formRef.current?.requestSubmit();
    setShowModal(false);
  };

  return (
    <>
      <form ref={formRef} action={deleteArticleAction} className="inline-block">
        <input type="hidden" name="id" value={id} />
        <button 
          type="button" 
          onClick={handleDeleteClick}
          className="rounded-lg p-2 text-rose-500 transition-colors hover:bg-rose-500/10 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          title="Delete article"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </form>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Delete Article"
        variant="danger"
        description="Are you sure you want to delete this article? This action cannot be undone."
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Article
            </Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-muted)]">
          This article will be permanently removed from your library.
        </p>
      </Modal>
    </>
  );
}
