import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LogOut, MailCheck } from 'lucide-react'
import { authApi } from '../../api/authApi'
import { useAuth } from '../../contexts/AuthContext'
import { flattenErrors } from '../../utils/flattenErrors'
import { getApiError } from '../../utils/getApiError'
import Alert from '../../components/common/Alert'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import OtpInput from '../../components/common/OtpInput'

export default function VerifyEmail() {
  const { user, setUser, isVerified, isAdmin, logout } = useAuth()
  const location = useLocation()

  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [sending, setSending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [flash, setFlash] = useState(null) // { tone, text }

  const [changing, setChanging] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [savingEmail, setSavingEmail] = useState(false)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  // Voamarina: mankany amin'ny toerana nokasaina
  if (isVerified) {
    const from = location.state?.from
    const fallback = isAdmin ? '/admin' : '/dashboard'
    return <Navigate to={from ? `${from.pathname}${from.search}` : fallback} replace />
  }

  const submit = async (value = code) => {
    if (value.length !== 6 || busy) return

    setBusy(true)
    setFlash(null)
    try {
      const res = await authApi.verifyCode(value)
      setUser(res.data.data)
    } catch (err) {
      setFlash({ tone: 'error', text: flattenErrors(err).code ?? getApiError(err) })
      setCode('')
    } finally {
      setBusy(false)
    }
  }

  const resend = async () => {
    setSending(true)
    setFlash(null)
    try {
      const res = await authApi.sendCode()
      setCooldown(res.data.retry_after ?? 60)
      setCode('')
      setFlash({ tone: 'success', text: `A new code was sent to ${user.email}.` })
    } catch (err) {
      const wait = err?.response?.data?.retry_after
      if (wait) setCooldown(wait)
      setFlash({ tone: 'error', text: getApiError(err) })
    } finally {
      setSending(false)
    }
  }

  const saveEmail = async (e) => {
    e.preventDefault()
    setSavingEmail(true)
    setEmailError('')
    try {
      const res = await authApi.changeEmail(newEmail.trim())
      setUser(res.data.data)
      setChanging(false)
      setNewEmail('')
      setCode('')
      setCooldown(60)
      setFlash({ tone: 'success', text: `We sent a new code to ${res.data.data.email}.` })
    } catch (err) {
      setEmailError(flattenErrors(err).email ?? getApiError(err))
    } finally {
      setSavingEmail(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-10">
      <Card className="w-full space-y-6">
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <MailCheck className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Verify your email</h1>
          <p className="mt-2 text-sm text-slate-500">
            We sent a 6-digit code to{' '}
            <span className="break-all font-medium text-slate-800">{user.email}</span>.
            Enter it below to continue.
          </p>
        </div>

        {flash && <Alert tone={flash.tone}>{flash.text}</Alert>}

        <OtpInput
          value={code}
          onChange={setCode}
          onComplete={submit}
          disabled={busy}
          error={flash?.tone === 'error'}
        />

        <Button className="w-full" loading={busy} disabled={code.length !== 6} onClick={() => submit()}>
          Verify email
        </Button>

        <div className="space-y-3 border-t border-slate-100 pt-5 text-center text-sm">
          <p className="text-slate-500">
            Did not get the code?{' '}
            {cooldown > 0 ? (
              <span className="font-medium text-slate-400">Resend in {cooldown}s</span>
            ) : (
              <button
                onClick={resend}
                disabled={sending}
                className="font-medium text-brand-600 hover:underline disabled:opacity-60"
              >
                {sending ? 'Sending...' : 'Resend code'}
              </button>
            )}
          </p>

          {changing ? (
            <form onSubmit={saveEmail} className="space-y-3 text-left">
              <Input
                label="Correct email address"
                type="email"
                autoComplete="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                error={emailError}
              />
              <div className="flex gap-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setChanging(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" loading={savingEmail} disabled={!newEmail.trim()}>
                  Update and resend
                </Button>
              </div>
            </form>
          ) : (
            <button onClick={() => setChanging(true)} className="text-slate-500 hover:text-slate-800 hover:underline">
              Wrong email address?
            </button>
          )}

          <div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-slate-400 transition hover:text-red-600"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}