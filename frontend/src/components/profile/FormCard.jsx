import Card from '../common/Card'

// Carte misy lohateny + votoaty + footer. Raha omena `onSubmit`, dia form ny votoaty sy ny footer.
export default function FormCard({ title, description, onSubmit, footer, children }) {
  const Wrapper = onSubmit ? 'form' : 'div'

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>

      <Wrapper onSubmit={onSubmit} noValidate={!!onSubmit}>
        <div className="space-y-5 px-5 py-5 sm:px-6">{children}</div>

        {footer && (
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            {footer}
          </div>
        )}
      </Wrapper>
    </Card>
  )
}