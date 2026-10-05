import Button from '../common/Button'
import FileUploader from '../common/FileUploader'

export default function Step4Files({ fields, files, onUpload, onRemove, onBack, onNext }) {
  const fileFields = fields.filter((f) => f.type === 'file')
  const byCategory = (category) => files.filter((f) => f.category === category)

  const missing = fileFields.filter((f) => f.is_required && byCategory(f.name).length === 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Attach your files</h2>
        <p className="mt-1 text-sm text-slate-500">Files are private and only visible to you and our team.</p>
      </div>

      <div className="space-y-6">
        {fileFields.map((field) => (
          <FileUploader
            key={field.id}
            label={field.is_required ? `${field.label} *` : field.label}
            multiple={false}
            files={byCategory(field.name)}
            onUpload={(file) => onUpload(file, field.name)}
            onRemove={onRemove}
          />
        ))}

        <FileUploader
          label="Additional files (optional)"
          help="Requirements document, logos, images, references... Max 10 files per order."
          files={byCategory('attachment')}
          onUpload={(file) => onUpload(file, 'attachment')}
          onRemove={onRemove}
        />
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={missing.length > 0}>
          Continue
        </Button>
      </div>
    </div>
  )
}