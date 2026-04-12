"""
短文生成器 - 给定一个主题，生成一篇适合儿童的短文
"""

import os
import datetime
from typing import Optional

# 默认保存目录
DEFAULT_OUTPUT_DIR = r"E:\20241229work\coderes\kidstechedu"

# 预定义的主题模板（可根据需要扩展）
TOPIC_TEMPLATES = {
    "人工智能": {
        "intro": "人工智能（AI）是一种让计算机变得聪明的技术。",
        "points": [
            "AI可以帮助我们学习，比如智能学习助手可以根据你的进度推荐练习题。",
            "AI可以识别图片和语音，比如你手机里的语音助手就是AI。",
            "AI可以帮助医生诊断疾病，让治疗更加准确。",
            "AI正在改变我们的生活，让很多事情变得更方便。"
        ],
        "conclusion": "未来，AI会变得越来越聪明，它会成为我们学习和生活的好帮手！"
    },
    "编程": {
        "intro": "编程就是用计算机语言和电脑对话，告诉电脑我们想让它做什么。",
        "points": [
            "学习编程可以锻炼逻辑思维，帮助我们更好地解决问题。",
            "编程可以创造有趣的游戏和动画，让我们的想象力变成现实。",
            "很多现在流行的游戏和APP都是程序员编写的。",
            "编程是一项很有用的技能，在很多领域都能用到。"
        ],
        "conclusion": "如果你想创造自己的游戏或应用，就从学习编程开始吧！"
    },
    "机器人": {
        "intro": "机器人是一种能够自动完成任务的机器。",
        "points": [
            "有些机器人长得像人，可以走路、说话，甚至跳舞。",
            "工业机器人可以帮助工厂制造汽车和电子产品。",
            "医疗机器人可以帮助医生做手术，非常精确。",
            "家里的扫地机器人可以自动帮我们打扫房间。"
        ],
        "conclusion": "机器人正在变得越来越聪明，它们会在更多地方帮助人类。"
    },
    "互联网": {
        "intro": "互联网就像一个巨大的网络，把全世界连接在一起。",
        "points": [
            "通过互联网，我们可以和朋友视频聊天，即使他们远在千里之外。",
            "互联网上有丰富的学习资源，我们可以查找各种知识。",
            "我们可以在网上购物、看电影、听音乐。",
            "互联网让信息传递变得非常快速和方便。"
        ],
        "conclusion": "互联网让世界变得更小，我们要学会正确使用它来学习和交流。"
    },
    "太空": {
        "intro": "太空是地球大气层以外的广阔空间，充满了神秘和奇妙。",
        "points": [
            "太空中有无数的星星、行星和星系，宇宙非常浩瀚。",
            "人类已经发射了探测器去探索火星、月球和其他星球。",
            "宇航员可以在太空中生活和工作，那里有很多有趣的现象。",
            "科学家正在寻找太空中的其他生命，探索宇宙的秘密。"
        ],
        "conclusion": "太空探索让我们对宇宙有了更多了解，未来也许我们可以去太空旅行！"
    },
    "环境保护": {
        "intro": "环境保护就是要保护好我们的地球家园。",
        "points": [
            "我们要节约用水和用电，减少浪费。",
            "不要乱扔垃圾，要学会垃圾分类和回收。",
            "多种树木，保护森林和野生动物。",
            "减少使用塑料袋，选择环保的用品。"
        ],
        "conclusion": "保护环境人人有责，从小事做起，让地球变得更美好！"
    },
    "数学": {
        "intro": "数学是一门研究数字、形状和规律的学科。",
        "points": [
            "数学帮助我们计算数量，比如买东西时要算价格。",
            "数学可以测量距离、时间和重量，在生活中很有用。",
            "数学里有有趣的图形，比如圆形、三角形和正方形。",
            "学好数学可以锻炼大脑，让我们变得更聪明。"
        ],
        "conclusion": "数学无处不在，它是理解世界的重要工具。"
    },
    "科学": {
        "intro": "科学是一种探索世界奥秘的方法。",
        "points": [
            "科学家通过观察和实验来发现自然规律。",
            "科学让我们了解天气变化、植物生长、动物行为。",
            "科学发明了很多有用的东西，比如电灯、电话和电脑。",
            "做科学实验很有趣，可以验证我们的猜想。"
        ],
        "conclusion": "保持好奇心，用科学的眼光看世界，你会发现很多奇妙的事情！"
    }
}


def generate_article(topic: str, custom_points: Optional[list] = None) -> str:
    """
    根据主题生成短文

    Args:
        topic: 文章主题
        custom_points: 自定义内容要点（可选）

    Returns:
        生成的短文内容
    """
    topic = topic.strip()

    # 尞找预定义模板
    template = TOPIC_TEMPLATES.get(topic)

    if template:
        # 使用预定义模板生成文章
        article = f"# {topic}\n\n"
        article += f"{template['intro']}\n\n"
        for i, point in enumerate(template['points'], 1):
            article += f"{i}. {point}\n"
        article += f"\n{template['conclusion']}\n"
    else:
        # 对于没有预定义模板的主题，生成通用格式文章
        article = f"# {topic}\n\n"
        article += f"今天我们来了解一下{topic}。\n\n"

        if custom_points:
            for i, point in enumerate(custom_points, 1):
                article += f"{i}. {point}\n"
        else:
            article += f"1. {topic}是一个有趣的话题。\n"
            article += f"2. 学习{topic}可以让我们增长知识。\n"
            article += f"3. 我们要多探索、多思考，深入了解{topic}。\n"

        article += f"\n希望你对{topic}有了更多的了解，继续学习吧！\n"

    return article


def save_article(article: str, topic: str, output_dir: str = DEFAULT_OUTPUT_DIR) -> str:
    """
    保存文章到文件

    Args:
        article: 文章内容
        topic: 文章主题
        output_dir: 输出目录

    Returns:
        保存的文件路径
    """
    # 确保目录存在
    os.makedirs(output_dir, exist_ok=True)

    # 生成文件名（使用主题和时间戳）
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_topic = topic.replace(" ", "_").replace("/", "_").replace("\\", "_")
    filename = f"{safe_topic}_{timestamp}.md"

    filepath = os.path.join(output_dir, filename)

    # 保存文件
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(article)

    return filepath


def main():
    """主函数 - 运行短文生成器"""
    print("=" * 50)
    print("     短文生成器 - 给定主题，生成适合儿童的短文")
    print("=" * 50)

    # 显示可用主题
    print("\n可用预定义主题：")
    for topic in TOPIC_TEMPLATES:
        print(f"  - {topic}")

    print("\n也可以输入任意主题，程序会生成通用格式的文章。")

    while True:
        # 获取用户输入的主题
        topic = input("\n请输入文章主题（输入 'q' 退出）：").strip()

        if topic.lower() == 'q':
            print("再见！")
            break

        if not topic:
            print("主题不能为空，请重新输入。")
            continue

        # 询问是否要添加自定义内容
        add_custom = input("是否要添加自定义内容要点？（y/n）：").strip().lower()

        custom_points = None
        if add_custom == 'y':
            print("请输入内容要点，每行一个，输入空行结束：")
            custom_points = []
            while True:
                point = input().strip()
                if not point:
                    break
                custom_points.append(point)

        # 生成文章
        print(f"\n正在生成关于「{topic}」的文章...")
        article = generate_article(topic, custom_points)

        # 显示文章预览
        print("\n文章预览：")
        print("-" * 40)
        print(article)
        print("-" * 40)

        # 保存文章
        filepath = save_article(article, topic)
        print(f"\n文章已保存到：{filepath}")

        # 询问是否继续
        continue_input = input("\n是否继续生成其他文章？（y/n）：").strip().lower()
        if continue_input != 'y':
            print("再见！")
            break


if __name__ == "__main__":
    main()