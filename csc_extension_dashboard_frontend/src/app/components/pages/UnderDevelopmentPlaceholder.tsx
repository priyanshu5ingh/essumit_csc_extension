import { useNavigate } from 'react-router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import { Construction, ArrowBack } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

const GOV = {
  navy:    '#0c2461',
  blue:    '#1a4592',
  saffron: '#FF9933',
  green:   '#138808',
  white:   '#ffffff',
  contentBg: '#eef2f7',
};

interface UnderDevelopmentPlaceholderProps {
  title: string;
  moduleName: string;
}

export default function UnderDevelopmentPlaceholder({ title, moduleName }: UnderDevelopmentPlaceholderProps) {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minHeight: '100%', pt: 8 }}>
      
      {/* Title & Badge */}
      <Box sx={{ textAlign: 'center', maxWidth: 600 }}>
        <Box sx={{ 
          display: 'inline-flex', alignItems: 'center', gap: 1, 
          bgcolor: alpha(GOV.saffron, 0.1), color: '#d97706', 
          px: 2, py: 0.5, borderRadius: '16px', mb: 2, 
          border: `1px solid ${alpha(GOV.saffron, 0.3)}`,
          fontSize: '13px', fontWeight: 600
        }}>
          <Construction sx={{ fontSize: 16 }} />
          Coming Soon
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: GOV.navy, mb: 1, fontFamily: 'Inter, sans-serif' }}>
          {title}
        </Typography>
        <Typography sx={{ color: '#6b7280', fontSize: '15px' }}>
          The {moduleName} is currently under development. This feature will be available in a future release of the CSC AI Co-Pilot Monitoring Dashboard.
        </Typography>
      </Box>

      {/* Existing User Info Card */}
      <Paper elevation={0} sx={{ 
        width: '100%', maxWidth: 450, 
        border: `1px solid ${alpha(GOV.blue, 0.15)}`, 
        borderRadius: 2, overflow: 'hidden' 
      }}>
        <Box sx={{ bgcolor: alpha(GOV.blue, 0.03), px: 3, py: 2, borderBottom: `1px solid ${alpha(GOV.blue, 0.1)}` }}>
          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: GOV.blue, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Current Session Details
          </Typography>
        </Box>
        <Box sx={{ p: 3, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: GOV.blue, border: `2px solid ${GOV.saffron}`, fontWeight: 700 }}>
            AD
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 700, color: GOV.navy, fontSize: '16px' }}>
              Admin User
            </Typography>
            <Typography sx={{ color: '#4b5563', fontSize: '14px', mb: 1 }}>
              District Officer · MeitY
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <Typography sx={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.5 }}>
              You are currently authenticated as an administrative user. Please return to the dashboard to continue monitoring operations.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Action */}
      <Button 
        variant="contained" 
        onClick={() => navigate('/')}
        startIcon={<ArrowBack />}
        sx={{ 
          bgcolor: GOV.blue, 
          '&:hover': { bgcolor: GOV.navy },
          textTransform: 'none',
          px: 3, py: 1, borderRadius: 2
        }}
      >
        Return to Dashboard
      </Button>

    </Box>
  );
}
