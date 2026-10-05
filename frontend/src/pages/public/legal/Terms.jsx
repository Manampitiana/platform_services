import LegalLayout from "../../../components/public/LegalLayout";
import { legal } from "../../../content/legal";


export default function Terms() {
  return <LegalLayout {...legal.terms} />
}