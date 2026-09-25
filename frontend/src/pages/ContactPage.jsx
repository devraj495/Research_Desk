import { useState } from 'react';
import Footer from '../components/Footer.jsx';
import Navbar from '../components/Navbar.jsx';

const CONTACT_EMAIL = 'hello@researchdesk.com';

function ContactPage({ onNavigate, user, onLogout }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    topic: 'Account or research help',
    message: '',
  });
  const [sent, setSent] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const subject = `[Research Desk] ${form.topic}`;
    const body = `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] px-4 py-4 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <Navbar currentPath="/contact" onNavigate={onNavigate} user={user} onLogout={onLogout} />

        <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_30px_90px_-55px_rgba(15,23,42,0.75)]">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-slate-950 p-8 text-white sm:p-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">Contact the team</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Talk to the right person.</h1>
              <p className="mt-4 max-w-md text-base leading-8 text-slate-300">
                Send your request to our official inbox. We’ll route account, research, and partnership questions to the appropriate manager.
              </p>

              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-8 inline-flex rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 font-bold text-emerald-200 transition hover:bg-emerald-400/20"
              >
                {CONTACT_EMAIL}
              </a>

              <div className="mt-10 space-y-5 border-t border-white/10 pt-7 text-sm">
                <div>
                  <p className="font-bold text-white">Account & research support</p>
                  <p className="mt-1 text-slate-400">Login help, research runs, reports, and feedback.</p>
                </div>
                <div>
                  <p className="font-bold text-white">Manager enquiries</p>
                  <p className="mt-1 text-slate-400">Use the form and select your topic; your message will be directed to the responsible manager.</p>
                </div>
                <div>
                  <p className="font-bold text-white">Partnerships</p>
                  <p className="mt-1 text-slate-400">Data providers, advisory firms, and platform integrations.</p>
                </div>
              </div>
            </div>

            <form className="p-8 sm:p-10" onSubmit={handleSubmit}>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">Send a message</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Your email app will open with the message addressed to our official contact.</p>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-bold text-slate-800">
                  Your name
                  <input name="name" value={form.name} onChange={updateField} required className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" placeholder="Your name" />
                </label>
                <label className="block text-sm font-bold text-slate-800">
                  Email address
                  <input name="email" type="email" value={form.email} onChange={updateField} required className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" placeholder="you@example.com" />
                </label>
              </div>

              <label className="mt-5 block text-sm font-bold text-slate-800">
                What can we help with?
                <select name="topic" value={form.topic} onChange={updateField} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100">
                  <option>Account or research help</option>
                  <option>Contact a manager</option>
                  <option>Partnership enquiry</option>
                  <option>Product feedback</option>
                </select>
              </label>

              <label className="mt-5 block text-sm font-bold text-slate-800">
                Message
                <textarea name="message" value={form.message} onChange={updateField} required rows="5" className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-3 py-3 font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" placeholder="Tell us how we can help." />
              </label>

              <button type="submit" className="mt-6 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800">
                Contact the team
              </button>
              {sent && <p className="mt-4 text-sm font-medium text-emerald-700">Your email app should now be open. If it did not open, email {CONTACT_EMAIL} directly.</p>}
            </form>
          </div>
        </section>
        <Footer onNavigate={onNavigate} />
      </div>
    </div>
  );
}

export default ContactPage;
