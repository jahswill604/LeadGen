import { Lead } from '../types';
import * as XLSX from 'xlsx';

export const exportToExcel = (leads: Lead[]) => {
  if (leads.length === 0) return;

  const isB2C = leads[0].leadType === 'b2c';

  // 1. Prepare Data for Excel
  const data = leads.map(lead => {
    if (isB2C) {
      const user = lead.decisionMakers[0] || { name: '', title: '', email: '' };
      return {
        'Platform': lead.companyName,
        'Post Link': lead.websiteUrl,
        'Sentiment / Industry': lead.industry,
        'Location': lead.country,
        'Post Content': lead.summary,
        'General Info': lead.generalEmail,
        'Date Posted': lead.size,
        'Quality Score': lead.qualityScore,
        'User Handle': user.name,
        'User Profile / Inbox Link': user.email, // Storing profile link/email here for B2C context
        'Verified?': 'Yes'
      };
    } else {
      // B2B Export
      const dm1 = lead.decisionMakers[0] || { name: '', title: '', email: '' };
      return {
        'Company Name': lead.companyName,
        'Website': lead.websiteUrl,
        'Industry': lead.industry,
        'Country': lead.country,
        'Summary': lead.summary,
        'General Email': lead.generalEmail,
        'Phone': lead.phoneNumber,
        'Employee Size': lead.size,
        'LinkedIn': lead.linkedinUrl,
        'Quality Score': lead.qualityScore,
        'Decision Maker Name': dm1.name,
        'Decision Maker Title': dm1.title,
        'Decision Maker Email': dm1.email
      };
    }
  });

  // 2. Create Workbook and Worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // 3. Auto-adjust column widths
  const columnWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(key.length, ...data.map(row => (row[key as keyof typeof row] || '').toString().length, 10))
  }));
  // Cap width at 50 to prevent super wide columns
  ws['!cols'] = columnWidths.map(w => ({ wch: Math.min(w.wch, 50) }));

  // 4. Append Sheet
  XLSX.utils.book_append_sheet(wb, ws, 'Leads');

  // 5. Generate File Download
  XLSX.writeFile(wb, `leads_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
};