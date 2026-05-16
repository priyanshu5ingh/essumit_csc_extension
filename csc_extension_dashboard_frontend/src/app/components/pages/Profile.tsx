import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import { ManageAccounts } from '@mui/icons-material';

const GOV = {
  navy: '#0c2461',
  blue: '#1a4592',
  saffron: '#FF9933',
};

export default function Profile() {
  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <ManageAccounts sx={{ fontSize: 28, color: GOV.blue }} />
        <Typography sx={{ fontSize: '22px', fontWeight: 700, color: GOV.navy }}>
          My Profile
        </Typography>
      </Box>
      <Divider sx={{ borderColor: GOV.saffron, borderWidth: 2, mb: 3 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
        <Avatar sx={{ width: 72, height: 72, bgcolor: GOV.blue,
          border: `3px solid ${GOV.saffron}`, fontSize: '24px', fontWeight: 700 }}>
          AD
        </Avatar>
        <Box>
          <Typography sx={{ fontSize: '18px', fontWeight: 700, color: GOV.navy }}>
            Admin User
          </Typography>
          <Typography sx={{ fontSize: '13px', color: '#6b7280' }}>
            District Officer · MeitY
          </Typography>
          <Typography sx={{ fontSize: '12px', color: GOV.blue, mt: 0.5 }}>
            admin@meity.gov.in
          </Typography>
        </Box>
      </Box>
      <Box sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 3,
        border: `1px solid #e2e8f0` }}>
        {[
          { label: 'Full Name', value: 'Admin User' },
          { label: 'Designation', value: 'District Officer' },
          { label: 'Department', value: 'MeitY · CSC e-Governance' },
          { label: 'Employee ID', value: 'CSC-DO-2024-001' },
          { label: 'Region', value: 'North India Zone' },
        ].map(({ label, value }) => (
          <Box key={label} sx={{ display: 'flex', py: 1.5,
            borderBottom: '1px solid #e2e8f0', '&:last-child': { borderBottom: 'none' } }}>
            <Typography sx={{ fontSize: '13px', color: '#6b7280', width: 160, flexShrink: 0 }}>
              {label}
            </Typography>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: GOV.navy }}>
              {value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}