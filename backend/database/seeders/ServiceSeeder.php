<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {

        if (Service::withTrashed()->exists()) {
            $this->command->warn('Services already exist. Seeder skipped.');
            return;
        }

        $design = Category::updateOrCreate(['slug' => 'design'], [
            'name' => 'Design', 'description' => 'CVs, logos and branding', 'sort_order' => 1,
        ]);
        $web = Category::updateOrCreate(['slug' => 'web'], [
            'name' => 'Web', 'description' => 'Websites and web applications', 'sort_order' => 2,
        ]);
        $other = Category::updateOrCreate(['slug' => 'custom'], [
            'name' => 'Custom', 'description' => 'Tailor-made projects', 'sort_order' => 3,
        ]);

        // [name, label, type, required, options]
        $definitions = [
            [
                'category' => $design,
                'data' => [
                    'slug' => 'cv-design', 'name' => 'CV Design', 'icon' => 'cv',
                    'short_description' => 'A clean, professional resume that helps you stand out to recruiters.',
                    'description' => "We design a modern, ATS-friendly CV based on your experience and goals. Choose a template, share your details and receive a polished PDF ready to send.",
                    'base_price' => 15000, 'estimated_days' => 2, 'revisions_included' => 1,
                    'requires_quote' => false, 'is_featured' => true, 'sort_order' => 1,
                ],
                'features' => ['Professional layout', 'Delivered as PDF', 'Proofreading included'],
                'packages' => [
                    ['name' => 'Basic', 'price' => 15000, 'days' => 2, 'revisions' => 1, 'popular' => false,
                        'features' => [['1 page', true], ['1 revision', true], ['Editable file (DOCX)', false]]],
                    ['name' => 'Standard', 'price' => 25000, 'days' => 3, 'revisions' => 2, 'popular' => true,
                        'features' => [['2 pages', true], ['2 revisions', true], ['Editable file (DOCX)', true]]],
                    ['name' => 'Premium', 'price' => 40000, 'days' => 4, 'revisions' => 3, 'popular' => false,
                        'features' => [['2 pages + cover letter', true], ['3 revisions', true], ['LinkedIn summary', true]]],
                ],
                'fields' => [
                    ['full_name', 'Full name', 'text', true, null],
                    ['objective', 'Career objective', 'textarea', false, null],
                    ['education', 'Education', 'textarea', true, null],
                    ['experience', 'Work experience', 'textarea', true, null],
                    ['skills', 'Skills', 'textarea', true, null],
                    ['cv_language', 'CV language', 'select', true, ['English', 'French', 'Malagasy']],
                    ['photo', 'Photo (optional)', 'file', false, null],
                ],
            ],
            [
                'category' => $design,
                'data' => [
                    'slug' => 'logo-design', 'name' => 'Logo Design', 'icon' => 'logo',
                    'short_description' => 'A memorable logo and brand identity tailored to your business.',
                    'description' => "We create a unique logo that reflects your brand values. You receive all the file formats you need for print and digital use.",
                    'base_price' => 50000, 'estimated_days' => 5, 'revisions_included' => 2,
                    'requires_quote' => false, 'is_featured' => true, 'sort_order' => 2,
                ],
                'features' => ['Original design', 'Transparent PNG and vector files', 'Full ownership'],
                'packages' => [
                    ['name' => 'Basic', 'price' => 50000, 'days' => 5, 'revisions' => 2, 'popular' => false,
                        'features' => [['2 concepts', true], ['PNG files', true], ['Vector source files', false]]],
                    ['name' => 'Standard', 'price' => 90000, 'days' => 6, 'revisions' => 3, 'popular' => true,
                        'features' => [['3 concepts', true], ['PNG + vector files', true], ['Color palette', true]]],
                    ['name' => 'Premium', 'price' => 150000, 'days' => 8, 'revisions' => 5, 'popular' => false,
                        'features' => [['5 concepts', true], ['Brand guidelines', true], ['Social media kit', true]]],
                ],
                'fields' => [
                    ['brand_name', 'Brand name', 'text', true, null],
                    ['activity', 'Business activity', 'textarea', true, null],
                    ['slogan', 'Slogan (optional)', 'text', false, null],
                    ['style', 'Preferred style', 'select', true, ['Minimal', 'Modern', 'Classic', 'Playful', 'Luxury']],
                    ['colors', 'Preferred colors', 'text', false, null],
                    ['inspirations', 'Inspirations or competitors', 'textarea', false, null],
                ],
            ],
            [
                'category' => $web,
                'data' => [
                    'slug' => 'website-creation', 'name' => 'Website Creation', 'icon' => 'website',
                    'short_description' => 'Modern, responsive websites built from a template or fully custom.',
                    'description' => "From a simple showcase site to a complete business website. Choose a template or describe your project and we build it for you.",
                    'base_price' => 300000, 'estimated_days' => 14, 'revisions_included' => 2,
                    'requires_quote' => false, 'is_featured' => true, 'sort_order' => 3,
                ],
                'features' => ['Responsive design', 'Basic SEO setup', 'Contact form'],
                'packages' => [
                    ['name' => 'Starter', 'price' => 300000, 'days' => 10, 'revisions' => 2, 'popular' => false,
                        'features' => [['Up to 3 pages', true], ['Responsive design', true], ['Blog', false]]],
                    ['name' => 'Business', 'price' => 700000, 'days' => 14, 'revisions' => 3, 'popular' => true,
                        'features' => [['Up to 8 pages', true], ['Contact form', true], ['Basic SEO', true]]],
                    ['name' => 'Advanced', 'price' => 1500000, 'days' => 30, 'revisions' => 5, 'popular' => false,
                        'features' => [['Custom features', true], ['Admin panel', true], ['Priority support', true]]],
                ],
                'fields' => [
                    ['company', 'Company or project name', 'text', true, null],
                    ['site_type', 'Type of website', 'select', true, ['Showcase', 'E-commerce', 'Blog', 'Portfolio', 'Other']],
                    ['goals', 'Website goals', 'textarea', true, null],
                    ['pages', 'Pages you need', 'textarea', false, null],
                    ['references', 'Reference websites (URLs)', 'textarea', false, null],
                    ['has_domain', 'Do you already have a domain?', 'select', false, ['Yes', 'No']],
                    ['deadline', 'Desired deadline', 'date', false, null],
                ],
            ],
            [
                'category' => $other,
                'data' => [
                    'slug' => 'custom-project', 'name' => 'Custom Project', 'icon' => 'custom',
                    'short_description' => 'Have a different need? Describe it and receive a tailored quote.',
                    'description' => "Tell us about your project and attach your requirements document if you have one. We will review it and send you a detailed quote before starting.",
                    'base_price' => null, 'estimated_days' => null, 'revisions_included' => 0,
                    'requires_quote' => true, 'is_featured' => true, 'sort_order' => 4,
                ],
                'features' => ['Personalized quote', 'Requirements review', 'Dedicated follow-up'],
                'packages' => [],
                'fields' => [
                    ['title', 'Project title', 'text', true, null],
                    ['description', 'Describe your project', 'textarea', true, null],
                    ['budget', 'Estimated budget (optional)', 'text', false, null],
                    ['deadline', 'Desired deadline', 'date', false, null],
                    ['requirements_file', 'Requirements document (PDF/DOC)', 'file', false, null],
                ],
            ],
        ];

        foreach ($definitions as $def) {
            $service = Service::updateOrCreate(
                ['slug' => $def['data']['slug']],
                $def['data'] + ['category_id' => $def['category']->id, 'is_active' => true]
            );

            // Recreate children so the seeder can be re-run safely
            $service->packages()->delete();
            $service->features()->delete();
            $service->formFields()->delete();

            foreach ($def['features'] as $i => $label) {
                $service->features()->create(['label' => $label, 'sort_order' => $i]);
            }

            foreach ($def['packages'] as $i => $p) {
                $package = $service->packages()->create([
                    'name' => $p['name'],
                    'slug' => strtolower($p['name']),
                    'price' => $p['price'],
                    'estimated_days' => $p['days'],
                    'revisions_included' => $p['revisions'],
                    'is_popular' => $p['popular'],
                    'sort_order' => $i,
                ]);

                foreach ($p['features'] as $j => [$label, $included]) {
                    $package->features()->create([
                        'label' => $label, 'is_included' => $included, 'sort_order' => $j,
                    ]);
                }
            }

            foreach ($def['fields'] as $i => [$name, $label, $type, $required, $options]) {
                $service->formFields()->create([
                    'name' => $name, 'label' => $label, 'type' => $type,
                    'is_required' => $required, 'options' => $options, 'sort_order' => $i,
                ]);
            }
        }
    }
}