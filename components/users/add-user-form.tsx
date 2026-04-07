type AddUserFormProps = {
  action: (formData: FormData) => void | Promise<void>;
};

export function AddUserForm({ action }: AddUserFormProps) {
  return (
    <form action={action} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Invite User</h2>
        <p className="mt-1 text-sm text-slate-600">Send an invite email and assign a role in this organization.</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-500"
          />
        </div>
        <div>
          <label htmlFor="role" className="mb-1 block text-sm font-medium text-slate-700">
            Role
          </label>
          <select
            id="role"
            name="role"
            defaultValue="agent"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-slate-500"
          >
            <option value="admin">Admin</option>
            <option value="agent">Agent</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        Invite User
      </button>
    </form>
  );
}
