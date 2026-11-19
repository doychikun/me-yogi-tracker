import { Dialog, DialogContent, DialogTitle, Box, IconButton } from "@mui/material"
import Close from '@mui/icons-material/Close'

// Pass the dialog body as children (not a component prop): an inline component
// would be a new type on every render and remount, wiping any form inside it.
const CustomDialog = ({ title, open, close, children }) =>
  <Dialog
    open={open}
    onClose={close}
    PaperProps={{ sx: { borderRadius: '24px', backgroundColor: '#FCFCF8' } }}
  >
    <DialogTitle sx={{ pt: 3, px: 3 }}>
      <Box display="flex" alignItems="center">
            <Box flexGrow={1} sx={{ fontWeight: 700, fontSize: 24, color: '#272727' }}>{title}</Box>
            <Box>
                <IconButton onClick={close} aria-label="Close">
                      <Close />
                </IconButton>
            </Box>
      </Box>
    </DialogTitle>
    <DialogContent sx={{ px: 3, pb: 3 }}>
      {children}
    </DialogContent>
  </Dialog>

export default CustomDialog
