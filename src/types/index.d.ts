type Accessors<T> = {
  [K in keyof T]: () => T[K]
}

// 用于插件扩展 this 的类型
interface ThisAddon {}

// 任何时候 Effects, Computed 都是 read-only
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
  Readonly<Ref> &
  Readonly<ThisAddon> &
  Readonly<{
    $uid: any
  }>

interface IPlugins {}

interface IModelOptions<State = {}, Effects = {}, Computed = {}, Ref = {}> {
  state?: State
  ref?: Ref
  // 在 computed 里, state 是 read-only
  // this 可以访问 State, Computed
  computed?: Accessors<Computed> &
    ThisType<CombineObject<Readonly<State>, Computed>>
  // this 可以访问 State, Effects, Computed
  effects?: Effects & ThisType<CombineObject<State, Effects, Computed>>
  plugins?: IPlugins
}

// store 外部可以直接访问 State, Effects, Computed
export function model<State, Effects, Computed, Ref>(
  options: IModelOptions<State, Effects, Computed, Ref>,
): CombineObject<State, Effects, Computed, Ref>
