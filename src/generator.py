import json
import os
from datetime import datetime, timedelta
from openai import OpenAI

# 初始化 OpenAI 客户端
# 需要设置环境变量 OPENAI_API_KEY
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_running_plan(start_date: datetime = None):
    if start_date is None:
        start_date = datetime.now()

    # System prompt 设定
    system_prompt = """
    你是一个专业的跑步教练。请生成一个为期16周的跑步训练计划。
    
    计划要求：
    1. 必须具有周期性：采用 "3周高强度训练 + 1周恢复/减量" 的循环模式。
    2. 总共16周。
    3. 针对有一定的跑步基础的跑者，目标是提升10公里或半马成绩。
    
    输出格式要求：
    必须是标准的 JSON 数组格式。数组中每一个元素代表一次训练（Workout）。
    不要包含任何 Markdown 格式（如 ```json ... ```），直接输出 JSON 字符串。
    
    每个训练对象的 JSON 结构如下（参考 Intervals.icu 格式）：
    {
        "week": 1,             // 第几周 (1-16)
        "day_of_week": 1,      // 周几 (1=周一, 7=周日)
        "name": "训练名称",     // 例如 "轻松跑", "间歇跑 8x400m"
        "description": "训练详情", // 具体的训练步骤，例如 "Warmup 10m\n8x400m @ 5k pace\nCooldown 10m"。请使用 Intervals.icu 能识别的文本格式。
        "type": "Run",         // 固定为 "Run"
        "category": "WORKOUT"  // 固定为 "WORKOUT"
    }
    
    请确保 JSON 语法正确。
    """

    user_prompt = "请生成一份完整的16周跑步课表。"

    try:
        response = client.chat.completions.create(
            model="gpt-4o", # 或者 gpt-4-turbo, 根据可用性调整
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={ "type": "json_object" } # 强制 JSON 输出
        )
        
        content = response.choices[0].message.content
        plan_data = json.loads(content)
        
        # 处理返回的数据结构，可能是 {"workouts": [...]} 或者直接是 [...]
        if isinstance(plan_data, dict):
            workouts = plan_data.get("workouts", plan_data.get("plan", []))
        elif isinstance(plan_data, list):
            workouts = plan_data
        else:
            workouts = []

        # 为每个 workout 计算具体的 start_date_local
        final_workouts = []
        for w in workouts:
            week = w.get("week", 1)
            day = w.get("day_of_week", 1)
            
            # 计算日期偏移: (week - 1) * 7 + (day - 1)
            days_offset = (week - 1) * 7 + (day - 1)
            workout_date = start_date + timedelta(days=days_offset)
            
            # 格式化为 ISO 8601 字符串 (Intervals.icu 偏好)
            # 假设早上 6 点开始训练
            w["start_date_local"] = workout_date.replace(hour=6, minute=0, second=0, microsecond=0).isoformat()
            
            # 移除辅助字段以保持整洁，或者保留也无妨
            # w.pop("week", None)
            # w.pop("day_of_week", None)
            
            final_workouts.append(w)
            
        return final_workouts

    except Exception as e:
        print(f"Error generating plan: {e}")
        return []

if __name__ == "__main__":
    # 测试生成
    plan = generate_running_plan()
    print(json.dumps(plan, indent=2, ensure_ascii=False))

