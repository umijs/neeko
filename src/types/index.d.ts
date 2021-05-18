type Accessors<T> = {
  [K in keyof T]: () => T[K]
}

// use for add method on this
interface ThisAddon {}

// Effects, Computed are always read-only
type CombineObject<
  State = {},
  Effects = {},
  Computed = {},
  Ref = {}
> = Readonly<State> &
  Readonly<Effects> &
  Readonly<Computed> &
  Readonly<{
    $update: (state: Partial<State>, nextTick?: boolean) => void
  }> &
  Readonly<{
    $update: (updater: (state: State) => void, nextTick?: boolean) => void
  }> &
  Readonly<{
    $new: () => CombineObject<State, Effects, Computed, Ref>
  }> &
  Readonly<{
    $unstable_record: () => void
    $unstable_goto: (fn: (index: number) => number) => void
    $unstable_recordLength: number
    $unstable_recordIndex: number
  }> &
  Readonly<Ref> &
  Readonly<ThisAddon> &
  Readonly<{
    $uid: any
  }>

interface IPlugins {}

interface IModelOptions<State = {}, Effects = {}, Computed = {}, Ref = {}> {
  state?: State | (() => State)
  ref?: Ref
  // in computed, state is read-only
  // this with State, Computed
  computed?: Accessors<Computed> &
    ThisType<CombineObject<Readonly<State>, Computed>>
  // this with State, Effects, Computed
  effects?: Effects & ThisType<CombineObject<State, Effects, Computed>>
  plugins?: IPlugins
}

// store with State, Effects, Computed
export function model<State, Effects, Computed, Ref>(
  options: IModelOptions<State, Effects, Computed, Ref> & ThisType<undefined>,
): CombineObject<State, Effects, Computed, Ref>
