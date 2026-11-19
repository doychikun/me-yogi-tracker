import './GoalChart.css'
import { useState, useEffect, useContext } from 'react'
import { VictoryPie, VictoryAnimation, VictoryLabel, Slice } from 'victory'
import { Card, CardContent, CardHeader, ThemeProvider, createTheme, CardActions, Button, Box } from '@mui/material'
import { Delete, Edit, Add } from '@mui/icons-material'
import CustomDialog from '../../../components/CustomDialog/CustomDialog'
import GoalAddEdit from './GoalAddEdit/GoalAddEdit'
import { removeGoal, createGoal } from '../../../services/goals/goals'
import AppContext from "../../../providers/AppContext"
import { v4 as uuidv4 } from 'uuid';

const theme = createTheme({
    components: {
        MuiCardContent: {
            styleOverrides: {
                root: {
                    padding: 0
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgb(248, 197, 92)'
                },
            },
        }
    },
})

const CustomSlice = ({ datum, ...props}) => 
    <Slice  
        {...props}
        cornerRadius={25}
        sliceStartAngle={datum.background ? 0 : props.sliceStartAngle}
        sliceEndAngle={datum.background ? 360 : props.sliceStartAngle}
        style={{ fill: !datum.background ? '#EC7063' : '#D5DBDB' }}
    />


const GoalChart = ({ data, refreshGoals, isGoalFromCurrentUser }) => {
    const { userData } = useContext(AppContext)
    const [chartData, setChartData] = useState({
        progress: data.progress,
        data: [{ y: data.goal - data.progress, background: true }, { y: data.progress }]
    })
    const [openDialog, setOpenDialog] = useState(false)

    const closeEdit = () => setOpenDialog(false)

    const openEdit = () => setOpenDialog(true)

    const removeGoalChart = () => {
        removeGoal({
            id: data.id,
            owner: data.owner
        }).then(refreshGoals)
    }
    
    const addGoalChartToCurrentUser = () => {
        const { name, owner,  goal, progress, unit, from, to } = data
        createGoal({
            id: uuidv4(),
            name: `${owner}'s ${name}`,
            owner: userData.username,
            goal,
            progress,
            unit,
            from,
            to,
        }).then(refreshGoals)
    }

    useEffect(() => {
        setChartData({
            progress: data.progress,
            data: [{ y: data.goal - data.progress, background: true }, { y: data.progress }]
        })
    }, [data])

    return (
        <ThemeProvider theme={theme}>
            <Card>
                <CardHeader
                    title={data.name}
                    titleTypographyProps={{ textAlign: 'start' }}
                    subheader={<><Box>{data.owner}</Box> <Box>From: {new Date(data.from).toDateString()}</Box> <Box>To: {new Date(data.to).toDateString()}</Box></>}
                    subheaderTypographyProps={{ textAlign: 'start' }}
                />
                <CardContent>
                    <svg viewBox='0 0 150 150' width='100%' height='100%'>
                        <VictoryPie
                            standalone={false}
                            animate={{ duration: 1000 }}
                            width={150}
                            height={150}
                            data={chartData.data}
                            innerRadius={40}
                            radius={50}
                            cornerRadius={25}
                            dataComponent={<CustomSlice />}
                            labels={() => null}
                            style={{
                                data: {
                                    fill: ({ datum }) => !datum.background ? '#EC7063' : '#D5DBDB'
                                }
                            }}
                        />
                        <VictoryAnimation duration={1000} data={chartData} children={(newProps) => {
                            return (
                                <VictoryLabel
                                    textAnchor='middle'
                                    verticalAnchor='middle'
                                    x={75} y={75}
                                    text={() => [`${Math.round(newProps.progress)}`, `${data.unit}`]}
                                    style={[
                                        { fontSize: 25, fontWeight: 'bold' },
                                        { fontSize: 15 },
                                    ]}
                                />
                            )
                        }}/>
                    </svg>
                </CardContent>
                <CardActions className='CardActions'>
                    {isGoalFromCurrentUser ? (
                            <>
                                <Button variant='contained' color='warning' startIcon={<Edit />} title='Edit' onClick={openEdit}>
                                    Edit
                                </Button>
                                <Button variant='contained' color='error' startIcon={<Delete />} title='Remove' onClick={removeGoalChart}>
                                    Remove
                                </Button>
                            </>
                        ) :
                        (
                            <Button variant='contained' color='success' startIcon={<Add />} title='Add to my goals' onClick={() => addGoalChartToCurrentUser()}>
                                Add to my goals
                            </Button>
                        )
                    }

                </CardActions>
            </Card>
            <CustomDialog title={'Edit'} open={openDialog} close={closeEdit}>
                <GoalAddEdit close={closeEdit} refreshGoals={refreshGoals} currentGoalData={data} />
            </CustomDialog>
        </ThemeProvider>
    )
}

export default GoalChart