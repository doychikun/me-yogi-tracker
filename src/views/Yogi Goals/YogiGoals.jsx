import './YogiGoals.css'
import GoalChart from './GoalChart/GoalChart'
import { Grid, Box, Button, Typography, Paper } from '@mui/material'
import { getUserGoals } from '../../services/goals/goals'
import { useState, useEffect, useContext, useMemo, useCallback } from 'react'
import FilterResults from './FilterResults/FilterResults'
import CustomDialog from '../../components/CustomDialog/CustomDialog'
import GoalAddEdit from './GoalChart/GoalAddEdit/GoalAddEdit'
import { Add } from '@mui/icons-material'
import AppContext from "../../providers/AppContext"
import SearchGoals from './SearchGoals/SearchGoals'
import ProgressChart from './ProgressChart/ProgressChart'
import LogSession from './LogSession/LogSession'
import { getUserSessions, createSession } from '../../services/sessions'
import { weeklyMinutesByStyle, currentStreak } from '../../common/sessionStats'

const YogiGoals = () => {
  const { userData } = useContext(AppContext)
  const [unfilteredGoals, setUnfilteredGoals] = useState(null)
  const [filteredGoals, setFilteredGoals] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [foundGoals, setFoundGoals] = useState(null)

  const closeAdd = () => setOpenDialog(false)
  const openAdd = () => setOpenDialog(true)

  // Single source of truth for "my goals": every add/edit/remove/copy calls this.
  // FilterResults resets the filtered list whenever unfilteredGoals changes.
  const refreshGoals = useCallback(() =>
    getUserGoals({ owner: userData.username })
      .then(setUnfilteredGoals)
      .catch(e => alert(e.message))
  , [userData])

  useEffect(() => {
    refreshGoals()
  }, [refreshGoals])


  const [sessions, setSessions] = useState([])

  useEffect(() => {
    getUserSessions({ owner: userData.username })
      .then(setSessions)
      .catch(e => alert(e.message))
  }, [userData])

  const logSession = (session) =>
    createSession({ owner: userData.username, ...session })
      .then(created => {
        setSessions(prevSessions => [...prevSessions, created])
        return true
      })
      .catch(e => {
        alert(e.message)
        return false
      })

  const weeklyMinutes = useMemo(() => weeklyMinutesByStyle(sessions), [sessions])
  const weeklyTotal = weeklyMinutes.reduce((total, { minutes }) => total + minutes, 0)
  const streak = useMemo(() => currentStreak(sessions), [sessions])

  return (
    <Box className='YogiGoals'>
           <Typography variant='h4' textAlign={'start'}>My daily hour of yoga practice</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper className='YogiGoals-stat' elevation={0}>
                <Typography variant='h3'>{streak}</Typography>
                <Typography variant='body2'>day streak</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper className='YogiGoals-stat' elevation={0}>
                <Typography variant='h3'>{weeklyTotal}</Typography>
                <Typography variant='body2'>minutes this week</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <ProgressChart weeklyMinutes={weeklyMinutes} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='h6' textAlign={'start'} marginBottom={2}>Log a practice session</Typography>
              <LogSession onLog={logSession} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={4}>
          <FilterResults unfilteredGoals={unfilteredGoals} setFilteredGoals={setFilteredGoals} />
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={6} >
            <Grid item alignSelf={'center'}>
                <Button
                  variant='contained'
                  color='success'
                  startIcon={<Add />}
                  title='Add'
                  onClick={openAdd}
                  fullWidth
                >
                  Add new goal
                </Button>
            </Grid>
            <Grid item>
                <SearchGoals setFoundGoals={setFoundGoals} />
            </Grid>
          </Grid>
        </Grid>
        {foundGoals?.length > 0 &&
          <Grid item xs={12}>
            <Typography variant='h4' textAlign={'start'}>Found goals</Typography>
          </Grid>
        }
        {foundGoals?.length > 0 && foundGoals.map((goal) => (
          <Grid item key={`${goal.owner}/${goal.id}`}>
            <GoalChart data={goal} refreshGoals={refreshGoals} isGoalFromCurrentUser={goal.owner === userData.username} />
          </Grid>
        ))}

        {filteredGoals?.length > 0 &&
          <Grid item xs={12}>
            <Typography variant='h4' textAlign={'start'}>My Goals</Typography>
          </Grid>
        }
        {filteredGoals?.length > 0 && filteredGoals.map((goal) => (
          <Grid item key={goal.id}>
            <GoalChart data={goal} refreshGoals={refreshGoals} isGoalFromCurrentUser={goal.owner === userData.username}/>
          </Grid>
        ))}
      </Grid>
      <CustomDialog title={'Add'} open={openDialog} close={closeAdd}>
        <GoalAddEdit close={closeAdd} refreshGoals={refreshGoals} />
      </CustomDialog>
    </Box>
  )
}

export default YogiGoals
