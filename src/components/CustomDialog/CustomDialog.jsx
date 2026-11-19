import { Dialog, DialogContent, DialogTitle, Box, IconButton } from "@mui/material"
import Close from '@mui/icons-material/Close'

// Pass the dialog body as children (not a component prop): an inline component
// would be a new type on every render and remount, wiping any form inside it.
const CustomDialog = ({ title, open, close, children }) =>
  <Dialog open={open} onClose={close}>
    <DialogTitle>
      <Box display="flex" alignItems="center">
            <Box flexGrow={1} >{title}</Box>
            <Box>
                <IconButton onClick={close}>
                      <Close />
                </IconButton>
            </Box>
      </Box>
    </DialogTitle>
    <DialogContent>
      {children}
    </DialogContent>
  </Dialog>

export default CustomDialog
