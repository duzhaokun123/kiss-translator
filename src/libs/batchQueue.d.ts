export interface BatchQueueOptions {
  /** 触发批处理的最大延迟等待时间（毫秒） */
  batchInterval?: number;
  /** 触发批处理的最大任务条数上限 */
  batchSize?: number;
  /** 整个批次中所有文本内容的最大字符长度上限 */
  batchLength?: number;
}

export interface StreamChunk {
  id: number;
  text: string;
  isComplete: boolean;
}

export interface BatchTaskArgs {
  onStreamChunk?: (chunk: StreamChunk) => void;
  [key: string]: unknown;
}

export interface BatchGeneratorItem {
  id: number;
  result?: string;
  partialText?: string;
  /** 默认视为 true；为 false 时表示流式中间状态 */
  isComplete?: boolean;
}

export type BatchTaskFn<R> = (
  payloads: string[],
  args?: BatchTaskArgs
) => AsyncIterable<BatchGeneratorItem> | PromiseLike<R[]> | R[];

export interface BatchQueueInstance<R> {
  /**
   * 向批处理队列添加一个新的翻译任务
   * @param data 需要翻译的原文本内容
   * @param args 附加参数（如流式回调等）
   */
  addTask(data: string, args?: BatchTaskArgs): Promise<R>;
  /** 销毁队列实例，拒绝所有未决任务并清理定时器 */
  destroy(): void;
}

/**
 * 批处理队列工厂函数
 * 支持生成器模式：当 taskFn 是异步生成器时，yield {id, result} 逐个返回结果；
 * 也支持普通 Promise 模式，taskFn 返回包含所有结果的数组。
 */
export function BatchQueue<R>(
  taskFn: BatchTaskFn<R>,
  options?: BatchQueueOptions
): BatchQueueInstance<R>;

/**
 * 获取指定 Key 的批处理队列实例（单例模式）
 */
export function getBatchQueue<R>(
  key: string,
  taskFn: BatchTaskFn<R>,
  options?: BatchQueueOptions
): BatchQueueInstance<R>;

/** 销毁所有活跃的批处理队列 */
export function clearAllBatchQueue(): void;
