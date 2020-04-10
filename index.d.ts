import * as React from 'react'

export interface MetronomeState {
  tempo: number
  beatsPerMeasure: number
  playing: boolean
  beat: number
  subdivision: number
  onTempoChange: (tempo: number) => void
  onPlay: () => void
}
export type MetronomeRender = (state: MetronomeState) => React.ReactElement
export interface MetronomeProps {
  tempo?: number
  beatsPerMeasure?: number
  subdivision?: number
  autoplay?: boolean
  beatFrequency?: number
  beatVolume?: number
  subdivisionFrequency?: number
  subdivisionVolume?: number
  render: MetronomeRender
  onTick?: () => void
  onSubtick?: () => void
  onStart?: () => void
  onStop?: () => void
}

declare class Metronome extends React.Component<MetronomeProps, any> {}
export default Metronome
